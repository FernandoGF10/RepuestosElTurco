from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class ModeloAuto(Base):
    __tablename__ = "modelos_auto"
    __table_args__ = (
        UniqueConstraint("marca_id", "nombre", name="uq_modelo_auto_marca_nombre"),
    )

    id = Column(Integer, primary_key=True, index=True)
    marca_id = Column(Integer, ForeignKey("marcas.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    marca = relationship("Marca", back_populates="modelos_auto")
    motores = relationship("MotorAuto", back_populates="modelo", cascade="all, delete-orphan")