from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MarcaCreate(BaseModel):
    nombre: str
    logo: Optional[str] = None

class MarcaResponse(BaseModel):
    id: int
    nombre: str
    logo: Optional[str] = None
    activa: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True