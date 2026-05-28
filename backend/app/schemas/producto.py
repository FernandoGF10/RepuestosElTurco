from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import uuid


class Compatibilidad(BaseModel):
    auto: str
    anios: str


class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    categoria: str
    marca: str
    precio: int
    descripcion: str = ""
    detalle: str = ""
    compatibilidad: list[Compatibilidad] = []
    imagen_url: str = ""
    stock: int = 0
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    marca: Optional[str] = None
    precio: Optional[int] = None
    descripcion: Optional[str] = None
    detalle: Optional[str] = None
    compatibilidad: Optional[list[Compatibilidad]] = None
    imagen_url: Optional[str] = None
    stock: Optional[int] = None
    activo: Optional[bool] = None


class ProductoStockUpdate(BaseModel):
    stock: int

    @field_validator("stock")
    @classmethod
    def stock_no_negativo(cls, v):
        if v < 0:
            raise ValueError("El stock no puede ser negativo")
        return v


class ProductoOut(ProductoBase):
    id: uuid.UUID
    creado_en: datetime
    actualizado_en: datetime

    model_config = {"from_attributes": True}
