from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship


class Subfamilia(Base):
    __tablename__ = "subfamilias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    familia_id = Column(Integer,ForeignKey("familias.id"),nullable=False)
    familia = relationship("Familia")