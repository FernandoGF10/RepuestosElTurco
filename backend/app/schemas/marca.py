from pydantic import BaseModel

class MarcaCreate(BaseModel):
    nombre: str
    logo: str

class MarcaResponse(BaseModel):
    id: int
    nombre: str
    logo: str

    class Config:
        from_attributes = True