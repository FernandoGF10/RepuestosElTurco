from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from app.core.database import Base


class EstadoPedido(str, enum.Enum):
    pendiente = "pendiente"
    preparando = "preparando"
    listo = "listo"
    entregado = "entregado"
    cancelado = "cancelado"


class EstadoPago(str, enum.Enum):
    no_aplica = "no_aplica"       # pagos en tienda, sin pasarela
    pendiente = "pendiente"
    en_proceso = "en_proceso"
    aprobado = "aprobado"
    rechazado = "rechazado"


class MetodoPago(str, enum.Enum):
    retiro_tienda = "retiro_tienda"
    mercado_pago = "mercado_pago"


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero = Column(String(20), unique=True, nullable=False, index=True)
    fecha = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    estado = Column(SAEnum(EstadoPedido), default=EstadoPedido.pendiente, nullable=False)

    # Cliente (sin tabla separada, inline en el pedido)
    cliente_nombre = Column(String(200), nullable=False)
    cliente_telefono = Column(String(30), nullable=False)
    cliente_email = Column(String(200), default="")

    total = Column(Integer, nullable=False)  # CLP
    notas = Column(Text, default="")

    # Pago (Mercado Pago)
    metodo_pago = Column(SAEnum(MetodoPago), default=MetodoPago.retiro_tienda, nullable=False)
    estado_pago = Column(SAEnum(EstadoPago), default=EstadoPago.no_aplica, nullable=False)
    mp_preference_id = Column(String(120), nullable=True)
    mp_payment_id = Column(String(120), nullable=True, index=True)

    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")


class PedidoItem(Base):
    __tablename__ = "pedido_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pedido_id = Column(UUID(as_uuid=True), ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(String(100), nullable=False)  # puede ser UUID o string legacy
    codigo = Column(String(50), nullable=False)
    nombre = Column(String(200), nullable=False)
    marca = Column(String(100), nullable=False)
    precio = Column(Integer, nullable=False)
    cantidad = Column(Integer, nullable=False)

    pedido = relationship("Pedido", back_populates="items")
