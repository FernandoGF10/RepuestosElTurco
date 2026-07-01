from pydantic import BaseModel
from typing import Optional


class FamiliaCreate(BaseModel):
    nombre: str
    imagen: Optional[str] = None


class FamiliaUpdate(BaseModel):
    nombre: Optional[str] = None
    imagen: Optional[str] = None


class FamiliaResponse(BaseModel):
    id: int
    nombre: str
    imagen: Optional[str] = None

    class Config:
        from_attributes = True