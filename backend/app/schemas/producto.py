from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime
import uuid


class Compatibilidad(BaseModel):
    auto: str
    anios: str


class ProductoCompatibilidadBase(BaseModel):
    marca_id: int
    modelo_id: int
    motor_id: int
    anio_desde: int
    anio_hasta: int

    @field_validator("anio_desde", "anio_hasta")
    @classmethod
    def anio_valido(cls, v: int):
        if v < 1900 or v > 2100:
            raise ValueError("El año debe estar entre 1900 y 2100")
        return v

    @model_validator(mode="after")
    def validar_rango_anios(self):
        if self.anio_hasta < self.anio_desde:
            raise ValueError("El año hasta no puede ser menor que el año desde")
        return self


class ProductoCompatibilidadCreate(ProductoCompatibilidadBase):
    pass


class ProductoCompatibilidadOut(ProductoCompatibilidadBase):
    id: int
    marca_nombre: Optional[str] = None
    modelo_nombre: Optional[str] = None
    motor_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    familia_id: int
    subfamilia_id: int
    marca: str
    precio: int
    descripcion: str = ""
    detalle: str = ""

    # Campo antiguo, lo dejamos para no romper productos existentes
    compatibilidad: list[Compatibilidad] = Field(default_factory=list)

    # Campo nuevo, este será el importante
    compatibilidades_auto: list[ProductoCompatibilidadCreate] = Field(default_factory=list)

    imagen_url: str = ""
    stock: int = 0
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    familia_id: Optional[int] = None
    subfamilia_id: Optional[int] = None
    marca: Optional[str] = None
    precio: Optional[int] = None
    descripcion: Optional[str] = None
    detalle: Optional[str] = None

    # Campo antiguo
    compatibilidad: Optional[list[Compatibilidad]] = None

    # Campo nuevo
    compatibilidades_auto: Optional[list[ProductoCompatibilidadCreate]] = None

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

    familia_id: Optional[int] = None
    subfamilia_id: Optional[int] = None

    familia_nombre: Optional[str] = None
    subfamilia_nombre: Optional[str] = None

    compatibilidades_auto: list[ProductoCompatibilidadOut] = Field(default_factory=list)

    creado_en: datetime
    actualizado_en: datetime

    model_config = {"from_attributes": True}