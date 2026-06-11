from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.marca import Marca
from app.schemas.marca import MarcaCreate, MarcaResponse
from app.core.database import get_db

router = APIRouter(
    prefix="/api/marcas",
    tags=["Marcas"]
)

@router.get("/", response_model=list[MarcaResponse])
def obtener_marcas(db: Session = Depends(get_db)):
    return db.query(Marca).all()

@router.post("/", response_model=MarcaResponse)
def crear_marca(
    marca: MarcaCreate,
    db: Session = Depends(get_db)
):
    nueva = Marca(
        nombre=marca.nombre,
        logo=marca.logo
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


@router.delete("/{marca_id}")
def eliminar_marca(
    marca_id: int,
    db: Session = Depends(get_db)
):
    marca = db.query(Marca).filter(
        Marca.id == marca_id
    ).first()

    if not marca:
        raise HTTPException(
            status_code=404,
            detail="Marca no encontrada"
        )

    db.delete(marca)
    db.commit()

    return {"mensaje": "Marca eliminada"}