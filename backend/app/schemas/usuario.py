from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime
import uuid

RolType = Literal["admin", "vendedor"]


class UsuarioCreate(BaseModel):
    username: str
    password: str
    rol: RolType = "vendedor"
    activo: bool = True

    @field_validator("username")
    @classmethod
    def username_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El nombre de usuario debe tener al menos 3 caracteres")
        return v


class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[RolType] = None
    activo: Optional[bool] = None


class UsuarioOut(BaseModel):
    id: uuid.UUID
    username: str
    rol: str
    activo: bool
    creado_en: datetime

    model_config = {"from_attributes": True}
