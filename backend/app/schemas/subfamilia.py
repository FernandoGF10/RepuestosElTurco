from pydantic import BaseModel


class SubfamiliaCreate(BaseModel):
    nombre: str
    familia_id: int


class SubfamiliaResponse(SubfamiliaCreate):
    id: int

    class Config:
        from_attributes = True