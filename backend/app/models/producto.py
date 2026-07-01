from sqlalchemy import Column, String, Boolean, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(200), nullable=False)
    marca = Column(String(100), nullable=False)
    precio = Column(Integer, nullable=False)  # en CLP entero
    descripcion = Column(Text, default="")
    detalle = Column(Text, default="")
    compatibilidad = Column(JSON, default=list)  # [{"auto": str, "anios": str}]
    imagen_url = Column(String(500), default="")
    stock = Column(Integer, default=0)
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    actualizado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                            onupdate=lambda: datetime.now(timezone.utc))
    familia_id = Column(Integer,ForeignKey("familias.id"),nullable=True)
    subfamilia_id = Column(Integer,ForeignKey("subfamilias.id"),nullable=True)

    familia = relationship("Familia")
    subfamilia = relationship("Subfamilia")

    compatibilidades_rel = relationship(
        "ProductoCompatibilidad",
        back_populates="producto",
        cascade="all, delete-orphan",
    )
