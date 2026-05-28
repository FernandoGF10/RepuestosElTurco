from sqlalchemy import Column, String, Integer
from app.core.database import Base


class Config(Base):
    __tablename__ = "config"

    id = Column(Integer, primary_key=True, default=1)  # siempre 1 fila
    nombre_negocio = Column(String(200), default="Repuestos El Turco")
    direccion = Column(String(300), default="Av. Principal 1234, Local 5")
    telefono1 = Column(String(30), default="+56 9 7742 4442")
    telefono2 = Column(String(30), default="+56 9 6629 3400")
    whatsapp = Column(String(30), default="+56977424442")
    email = Column(String(200), default="contacto@repuestoselturco.cl")
    horario = Column(String(200), default="Lun-Vie 9:00-18:00 | Sáb 10:00-14:00")
    ciudad = Column(String(100), default="Santiago, Chile")
