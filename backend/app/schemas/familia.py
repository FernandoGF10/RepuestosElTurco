from pydantic import BaseModel


class FamiliaCreate(BaseModel):
    nombre: str
    imagen: str


class FamiliaResponse(FamiliaCreate):
    id: int

    class Config:
        from_attributes = True