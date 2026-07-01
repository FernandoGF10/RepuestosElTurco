import uuid
import logging

import mercadopago
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.database import get_db
from app.models.pedido import EstadoPago, EstadoPedido, MetodoPago, Pedido
from app.schemas.pago import EstadoPagoOut, PagoProcesarIn, PagoProcesarOut, PreferenciaOut, PublicKeyOut

router = APIRouter(prefix="/api/pagos", tags=["pagos"])
settings = get_settings()
logger = logging.getLogger("pagos")

_ESTADO_MP_A_LOCAL = {
    "approved": EstadoPago.aprobado,
    "rejected": EstadoPago.rechazado,
    "cancelled": EstadoPago.rechazado,
    "refunded": EstadoPago.rechazado,
    "charged_back": EstadoPago.rechazado,
    "in_process": EstadoPago.en_proceso,
    "in_mediation": EstadoPago.en_proceso,
    "pending": EstadoPago.pendiente,
    "authorized": EstadoPago.en_proceso,
}


def _sdk() -> mercadopago.SDK:
    if not settings.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Mercado Pago no está configurado: falta MP_ACCESS_TOKEN en el backend (.env).",
        )
    return mercadopago.SDK(settings.MP_ACCESS_TOKEN)


def _load_pedido(db: Session, pedido_id: uuid.UUID) -> Pedido:
    pedido = (
        db.query(Pedido)
        .options(joinedload(Pedido.items))
        .filter(Pedido.id == pedido_id)
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


def _aplicar_estado_pago(db: Session, pedido: Pedido, payment: dict) -> Pedido:
    """Actualiza el pedido a partir de un objeto payment devuelto por la API de MP."""
    mp_status = payment.get("status")
    nuevo_estado_pago = _ESTADO_MP_A_LOCAL.get(mp_status, EstadoPago.pendiente)

    pedido.mp_payment_id = str(payment.get("id")) if payment.get("id") else pedido.mp_payment_id
    pedido.estado_pago = nuevo_estado_pago

    if nuevo_estado_pago == EstadoPago.aprobado and pedido.estado == EstadoPedido.pendiente:
        pedido.estado = EstadoPedido.preparando

    db.commit()
    db.refresh(pedido)
    return pedido


def _procesar_payment_id(db: Session, payment_id: str) -> Pedido | None:
    """Consulta un pago por su ID directamente contra la API de Mercado Pago
    (nunca confiar en el estado que llega en el body/query de una notificación
    o de la URL de retorno) y aplica el resultado al pedido correspondiente."""
    sdk = _sdk()
    result = sdk.payment().get(payment_id)

    if result.get("status") != 200:
        logger.warning("No se pudo consultar el pago %s en Mercado Pago: %s", payment_id, result)
        return None

    payment = result["response"]
    external_reference = payment.get("external_reference")
    if not external_reference:
        return None

    try:
        pedido_id = uuid.UUID(external_reference)
    except ValueError:
        return None

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        return None

    return _aplicar_estado_pago(db, pedido, payment)


# ── Público: clave pública para inicializar el Payment Brick en el frontend ──

@router.get("/public-key", response_model=PublicKeyOut)
def public_key():
    if not settings.MP_PUBLIC_KEY:
        raise HTTPException(
            status_code=500,
            detail="Mercado Pago no está configurado: falta MP_PUBLIC_KEY en el backend (.env).",
        )
    return PublicKeyOut(public_key=settings.MP_PUBLIC_KEY)


# ── Público: cobrar un pedido directamente (checkout embebido, sin redirigir) ─

@router.post("/procesar/{pedido_id}", response_model=PagoProcesarOut)
def procesar_pago(pedido_id: uuid.UUID, data: PagoProcesarIn, db: Session = Depends(get_db)):
    pedido = _load_pedido(db, pedido_id)

    if pedido.estado_pago == EstadoPago.aprobado:
        raise HTTPException(status_code=409, detail="Este pedido ya fue pagado.")

    sdk = _sdk()

    payment_data = {
        "transaction_amount": float(pedido.total),
        "token": data.token,
        "description": f"Pedido {pedido.numero} - Repuestos El Turco",
        "installments": data.installments,
        "payment_method_id": data.payment_method_id,
        "issuer_id": data.issuer_id,
        "payer": {
            "email": data.payer_email,
            **(
                {"identification": {"type": data.identification.type, "number": data.identification.number}}
                if data.identification
                else {}
            ),
        },
        "external_reference": str(pedido.id),
    }

    result = sdk.payment().create(payment_data)

    if result.get("status") not in (200, 201):
        logger.error("Error procesando pago de Mercado Pago: %s", result)
        detalle = result.get("response", {}).get("message", "No se pudo procesar el pago.")
        raise HTTPException(status_code=402, detail=detalle)

    payment = result["response"]

    pedido.metodo_pago = MetodoPago.mercado_pago
    pedido = _aplicar_estado_pago(db, pedido, payment)

    return PagoProcesarOut(
        status=payment.get("status", ""),
        status_detail=payment.get("status_detail", ""),
        estado_pago=pedido.estado_pago,
        numero=pedido.numero,
    )


# ── Público: iniciar el pago de un pedido ya creado (alternativa con redirect) ─

@router.post("/preferencia/{pedido_id}", response_model=PreferenciaOut)
def crear_preferencia(pedido_id: uuid.UUID, db: Session = Depends(get_db)):
    pedido = _load_pedido(db, pedido_id)

    if pedido.estado_pago == EstadoPago.aprobado:
        raise HTTPException(status_code=409, detail="Este pedido ya fue pagado.")

    sdk = _sdk()

    items = [
        {
            "title": f"{item.nombre} ({item.codigo})",
            "quantity": item.cantidad,
            "unit_price": float(item.precio),
            "currency_id": "CLP",
        }
        for item in pedido.items
    ]

    preference_data = {
        "items": items,
        "external_reference": str(pedido.id),
        "back_urls": {
            "success": f"{settings.FRONTEND_URL}/pedido/{pedido.numero}",
            "failure": f"{settings.FRONTEND_URL}/pedido/{pedido.numero}",
            "pending": f"{settings.FRONTEND_URL}/pedido/{pedido.numero}",
        },
        "statement_descriptor": "REPUESTOS EL TURCO",
    }

    # Mercado Pago rechaza auto_return si la back_url no es una URL pública
    # (localhost/127.0.0.1 no son válidas para esa validación).
    es_url_publica = "localhost" not in settings.FRONTEND_URL and "127.0.0.1" not in settings.FRONTEND_URL
    if es_url_publica:
        preference_data["auto_return"] = "approved"

    if settings.MP_WEBHOOK_URL:
        preference_data["notification_url"] = f"{settings.MP_WEBHOOK_URL}/api/pagos/webhook"

    result = sdk.preference().create(preference_data)

    if result.get("status") not in (200, 201):
        logger.error("Error creando preferencia de Mercado Pago: %s", result)
        raise HTTPException(status_code=502, detail="No se pudo iniciar el pago con Mercado Pago.")

    pref = result["response"]

    pedido.mp_preference_id = pref["id"]
    pedido.metodo_pago = MetodoPago.mercado_pago
    pedido.estado_pago = EstadoPago.pendiente
    db.commit()

    init_point = pref.get("init_point") or pref.get("sandbox_init_point")

    return PreferenciaOut(
        preference_id=pref["id"],
        init_point=init_point,
        public_key=settings.MP_PUBLIC_KEY,
    )


# ── Público: la página de retorno usa esto para reflejar el estado real ──────
# (no confiar en los query params ?status=... que agrega Mercado Pago a la
# back_url; siempre se re-verifica contra la API de pagos)

@router.get("/verificar", response_model=EstadoPagoOut)
def verificar_pago(
    payment_id: str | None = None,
    pedido_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    if payment_id:
        pedido = _procesar_payment_id(db, payment_id)
        if not pedido:
            raise HTTPException(status_code=404, detail="No se pudo verificar el pago indicado.")
    elif pedido_id:
        pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
    else:
        raise HTTPException(status_code=422, detail="Debes indicar payment_id o pedido_id")

    return EstadoPagoOut(
        numero=pedido.numero,
        estado=pedido.estado,
        estado_pago=pedido.estado_pago,
        mp_payment_id=pedido.mp_payment_id,
    )


# ── Webhook de Mercado Pago (requiere MP_WEBHOOK_URL público, p. ej. ngrok) ──

@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}

    topic = request.query_params.get("type") or body.get("type") or body.get("topic")
    payment_id = (
        request.query_params.get("data.id")
        or body.get("data", {}).get("id")
        or (body.get("resource", "").rsplit("/", 1)[-1] if topic == "payment" else None)
    )

    if topic == "payment" and payment_id:
        _procesar_payment_id(db, str(payment_id))

    return {"received": True}
