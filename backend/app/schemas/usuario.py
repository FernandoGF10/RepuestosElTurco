from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class UsuarioCreate(BaseModel):
    username: str
    password: str
    activo: bool = True


class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    activo: Optional[bool] = None


class UsuarioOut(BaseModel):
    id: uuid.UUID
    username: str
    activo: bool
    creado_en: datetime

    model_config = {"from_attributes": True}
