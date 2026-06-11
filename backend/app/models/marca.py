from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Marca(Base):
    __tablename__ = "marcas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    logo = Column(String(255))
    activa = Column(Boolean, default=True)