from pydantic import BaseModel
from typing import Optional


class FamiliaCreate(BaseModel):
    nombre: str
    imagen: Optional[str] = None


class FamiliaResponse(FamiliaCreate):
    id: int

    class Config:
        from_attributes = True