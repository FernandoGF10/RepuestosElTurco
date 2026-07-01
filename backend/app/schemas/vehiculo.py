from pydantic import BaseModel, field_validator


class MarcaVehiculoOut(BaseModel):
    id: int
    nombre: str
    logo: str | None = None
    activa: bool = True

    model_config = {"from_attributes": True}


class ModeloAutoBase(BaseModel):
    marca_id: int
    nombre: str
    activo: bool = True

    @field_validator("nombre")
    @classmethod
    def nombre_obligatorio(cls, v: str):
        if not v or not v.strip():
            raise ValueError("El nombre del modelo es obligatorio")
        return v.strip()


class ModeloAutoCreate(ModeloAutoBase):
    pass


class ModeloAutoOut(ModeloAutoBase):
    id: int
    marca_nombre: str | None = None

    model_config = {"from_attributes": True}


class MotorAutoBase(BaseModel):
    modelo_id: int
    nombre: str
    activo: bool = True

    @field_validator("nombre")
    @classmethod
    def nombre_obligatorio(cls, v: str):
        if not v or not v.strip():
            raise ValueError("El nombre del motor es obligatorio")
        return v.strip()


class MotorAutoCreate(MotorAutoBase):
    pass


class MotorAutoOut(MotorAutoBase):
    id: int
    modelo_nombre: str | None = None

    model_config = {"from_attributes": True}