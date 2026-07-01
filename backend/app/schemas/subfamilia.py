from pydantic import BaseModel
from typing import Optional


class SubfamiliaCreate(BaseModel):
    nombre: str
    familia_id: int


class SubfamiliaUpdate(BaseModel):
    nombre: Optional[str] = None
    familia_id: Optional[int] = None


class SubfamiliaResponse(BaseModel):
    id: int
    nombre: str
    familia_id: int

    class Config:
        from_attributes = True