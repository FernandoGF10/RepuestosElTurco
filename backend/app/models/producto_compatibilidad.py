from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class ProductoCompatibilidad(Base):
    __tablename__ = "producto_compatibilidades"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("productos.id", ondelete="CASCADE"), nullable=False, index=True)

    marca_id = Column(Integer, ForeignKey("marcas.id"), nullable=False, index=True)
    modelo_id = Column(Integer, ForeignKey("modelos_auto.id"), nullable=False, index=True)
    motor_id = Column(Integer, ForeignKey("motores_auto.id"), nullable=False, index=True)

    anio_desde = Column(Integer, nullable=False)
    anio_hasta = Column(Integer, nullable=False)

    producto = relationship("Producto", back_populates="compatibilidades_rel")
    marca = relationship("Marca")
    modelo = relationship("ModeloAuto")
    motor = relationship("MotorAuto")