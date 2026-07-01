from pydantic import BaseModel
from typing import Optional


class FamiliaCreate(BaseModel):
    nombre: str
    imagen: Optional[str] = None
    posicion: Optional[int] = None


class FamiliaUpdate(BaseModel):
    nombre: Optional[str] = None
    imagen: Optional[str] = None
    posicion: Optional[int] = None


class FamiliaOrdenItem(BaseModel):
    id: int
    posicion: int


class FamiliaResponse(BaseModel):
    id: int
    nombre: str
    imagen: Optional[str] = None
    posicion: int = 0

    class Config:
        from_attributes = True
