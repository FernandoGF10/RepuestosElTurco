from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.familia import Familia
from app.schemas.familia import FamiliaCreate, FamiliaResponse

router = APIRouter(
    prefix="/api/familias",
    tags=["Familias"]
)


@router.get("/", response_model=list[FamiliaResponse])
def obtener_familias(db: Session = Depends(get_db)):
    return db.query(Familia).all()


@router.post("/", response_model=FamiliaResponse)
def crear_familia(
    familia: FamiliaCreate,
    db: Session = Depends(get_db)
):
    nueva = Familia(
        nombre=familia.nombre,
        imagen=familia.imagen
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


@router.delete("/{familia_id}")
def eliminar_familia(
    familia_id: int,
    db: Session = Depends(get_db)
):
    familia = db.query(Familia).filter(
        Familia.id == familia_id
    ).first()

    if not familia:
        raise HTTPException(
            status_code=404,
            detail="Familia no encontrada"
        )

    db.delete(familia)
    db.commit()

    return {"ok": True}