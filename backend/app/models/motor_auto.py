from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class MotorAuto(Base):
    __tablename__ = "motores_auto"
    __table_args__ = (
        UniqueConstraint("modelo_id", "nombre", name="uq_motor_auto_modelo_nombre"),
    )

    id = Column(Integer, primary_key=True, index=True)
    modelo_id = Column(Integer, ForeignKey("modelos_auto.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    modelo = relationship("ModeloAuto", back_populates="motores")