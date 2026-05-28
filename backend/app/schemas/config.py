from pydantic import BaseModel
from typing import Optional


class ConfigOut(BaseModel):
    nombre_negocio: str
    direccion: str
    telefono1: str
    telefono2: str
    whatsapp: str
    email: str
    horario: str
    ciudad: str

    model_config = {"from_attributes": True}


class ConfigUpdate(BaseModel):
    nombre_negocio: Optional[str] = None
    direccion: Optional[str] = None
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    horario: Optional[str] = None
    ciudad: Optional[str] = None


# Reportes
class TopProducto(BaseModel):
    producto_id: str
    codigo: str
    nombre: str
    cantidad: int
    total: int


class ReporteOut(BaseModel):
    total_ventas: int
    cant_pedidos: int
    ticket_promedio: int
    total_unidades: int
    top_productos: list[TopProducto]


class ClienteResumen(BaseModel):
    nombre: str
    telefono: str
    email: str
    total_pedidos: int
    total_gastado: int
    ultimo_pedido: str  # ISO date
