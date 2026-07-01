from pydantic import BaseModel
from typing import Optional
from app.models.pedido import EstadoPago, EstadoPedido


class PreferenciaOut(BaseModel):
    preference_id: str
    init_point: str
    public_key: str


class EstadoPagoOut(BaseModel):
    numero: str
    estado: EstadoPedido
    estado_pago: EstadoPago
    mp_payment_id: Optional[str] = None


class PublicKeyOut(BaseModel):
    public_key: str


class IdentificacionIn(BaseModel):
    type: str
    number: str


class PagoProcesarIn(BaseModel):
    """Payload que entrega el Payment Brick de Mercado Pago (`onSubmit`)."""
    token: Optional[str] = None
    issuer_id: Optional[str] = None
    payment_method_id: str
    installments: int = 1
    payer_email: str
    identification: Optional[IdentificacionIn] = None


class PagoProcesarOut(BaseModel):
    status: str
    status_detail: str
    estado_pago: EstadoPago
    numero: str
