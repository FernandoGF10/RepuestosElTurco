from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.pedido import Pedido, PedidoItem, EstadoPedido
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate, PedidoOut, EstadoUpdate
import uuid

router = APIRouter(prefix="/api/pedidos", tags=["pedidos"])


def _next_numero(db: Session) -> str:
    """Genera el próximo número de pedido P-XXXX."""
    last = db.query(Pedido).order_by(Pedido.fecha.desc()).first()
    if not last or not last.numero.startswith("P-"):
        return "P-1001"
    try:
        n = int(last.numero.split("-")[1]) + 1
    except (IndexError, ValueError):
        n = 1001
    return f"P-{n}"


def _load(db: Session, pedido_id: uuid.UUID) -> Pedido:
    p = (
        db.query(Pedido)
        .options(joinedload(Pedido.items))
        .filter(Pedido.id == pedido_id)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return p


# ── Público: crear pedido desde el carrito ───────────────────────────────────

@router.post("", response_model=PedidoOut, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, db: Session = Depends(get_db)):
    if not data.items:
        raise HTTPException(status_code=422, detail="El pedido debe tener al menos un ítem")

    total = sum(i.precio * i.cantidad for i in data.items)

    pedido = Pedido(
        numero=_next_numero(db),
        cliente_nombre=data.cliente.nombre,
        cliente_telefono=data.cliente.telefono,
        cliente_email=data.cliente.email or "",
        total=total,
        notas=data.notas or "",
    )
    db.add(pedido)
    db.flush()  # obtener el id antes del commit

    for item in data.items:
        db.add(PedidoItem(
            pedido_id=pedido.id,
            producto_id=item.producto_id,
            codigo=item.codigo,
            nombre=item.nombre,
            marca=item.marca,
            precio=item.precio,
            cantidad=item.cantidad,
        ))

    db.commit()
    return PedidoOut.from_orm_pedido(_load(db, pedido.id))


# ── Admin ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[PedidoOut])
def listar_pedidos(
    estado: EstadoPedido | None = Query(None),
    buscar: str | None = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    q = db.query(Pedido).options(joinedload(Pedido.items))
    if estado:
        q = q.filter(Pedido.estado == estado)
    if buscar:
        t = f"%{buscar}%"
        q = q.filter(
            Pedido.numero.ilike(t)
            | Pedido.cliente_nombre.ilike(t)
            | Pedido.cliente_telefono.ilike(t)
        )
    pedidos = q.order_by(Pedido.fecha.desc()).all()
    return [PedidoOut.from_orm_pedido(p) for p in pedidos]


@router.get("/{pedido_id}", response_model=PedidoOut)
def obtener_pedido(
    pedido_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return PedidoOut.from_orm_pedido(_load(db, pedido_id))


@router.patch("/{pedido_id}/estado", response_model=PedidoOut)
def cambiar_estado(
    pedido_id: uuid.UUID,
    data: EstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = _load(db, pedido_id)
    p.estado = data.estado
    db.commit()
    return PedidoOut.from_orm_pedido(_load(db, pedido_id))


@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pedido(
    pedido_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    db.delete(p)
    db.commit()
