from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Familia(Base):
    __tablename__ = "familias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    imagen = Column(String(500))
    posicion = Column(Integer, nullable=False, default=0, server_default="0", index=True)