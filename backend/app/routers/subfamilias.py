from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.subfamilia import Subfamilia
from app.schemas.subfamilia import (
    SubfamiliaCreate,
    SubfamiliaResponse
)

router = APIRouter(
    prefix="/api/subfamilias",
    tags=["Subfamilias"]
)


@router.get("/", response_model=list[SubfamiliaResponse])
def obtener_subfamilias(
    db: Session = Depends(get_db)
):
    return db.query(Subfamilia).all()


@router.post("/", response_model=SubfamiliaResponse)
def crear_subfamilia(
    subfamilia: SubfamiliaCreate,
    db: Session = Depends(get_db)
):
    nueva = Subfamilia(
        nombre=subfamilia.nombre,
        familia_id=subfamilia.familia_id
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


@router.delete("/{subfamilia_id}")
def eliminar_subfamilia(
    subfamilia_id: int,
    db: Session = Depends(get_db)
):
    subfamilia = db.query(Subfamilia).filter(
        Subfamilia.id == subfamilia_id
    ).first()

    if not subfamilia:
        raise HTTPException(
            status_code=404,
            detail="Subfamilia no encontrada"
        )

    db.delete(subfamilia)
    db.commit()

    return {"ok": True}