from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.pedido import EstadoPedido, EstadoPago, MetodoPago
import uuid


class ClienteIn(BaseModel):
    nombre: str
    telefono: str
    email: Optional[str] = ""


class PedidoItemIn(BaseModel):
    producto_id: str
    codigo: str
    nombre: str
    marca: str
    precio: int
    cantidad: int


class PedidoCreate(BaseModel):
    cliente: ClienteIn
    items: list[PedidoItemIn]
    notas: Optional[str] = ""
    metodo_pago: Optional[MetodoPago] = MetodoPago.retiro_tienda


class EstadoUpdate(BaseModel):
    estado: EstadoPedido


class ClienteOut(BaseModel):
    nombre: str
    telefono: str
    email: str


class PedidoItemOut(BaseModel):
    id: uuid.UUID
    producto_id: str
    codigo: str
    nombre: str
    marca: str
    precio: int
    cantidad: int

    model_config = {"from_attributes": True}


class PedidoOut(BaseModel):
    id: uuid.UUID
    numero: str
    fecha: datetime
    estado: EstadoPedido
    cliente: ClienteOut
    items: list[PedidoItemOut]
    total: int
    notas: str
    metodo_pago: MetodoPago
    estado_pago: EstadoPago

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_pedido(cls, p):
        return cls(
            id=p.id,
            numero=p.numero,
            fecha=p.fecha,
            estado=p.estado,
            cliente=ClienteOut(
                nombre=p.cliente_nombre,
                telefono=p.cliente_telefono,
                email=p.cliente_email or "",
            ),
            items=[PedidoItemOut.model_validate(i) for i in p.items],
            total=p.total,
            notas=p.notas or "",
            metodo_pago=p.metodo_pago,
            estado_pago=p.estado_pago,
        )
