from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models.familia import Familia
from app.models.subfamilia import Subfamilia
from app.models.producto import Producto
from app.schemas.subfamilia import (
    SubfamiliaCreate,
    SubfamiliaUpdate,
    SubfamiliaResponse
)

router = APIRouter(
    prefix="/api/subfamilias",
    tags=["Subfamilias"]
)


@router.get("/", response_model=list[SubfamiliaResponse])
def obtener_subfamilias(db: Session = Depends(get_db)):
    return db.query(Subfamilia).order_by(Subfamilia.nombre).all()


@router.post("/", response_model=SubfamiliaResponse, status_code=status.HTTP_201_CREATED)
def crear_subfamilia(
    subfamilia: SubfamiliaCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    nombre = subfamilia.nombre.strip()

    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre de la subfamilia es obligatorio")

    familia = db.query(Familia).filter(Familia.id == subfamilia.familia_id).first()

    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")

    existe = db.query(Subfamilia).filter(
        Subfamilia.nombre.ilike(nombre),
        Subfamilia.familia_id == subfamilia.familia_id
    ).first()

    if existe:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una subfamilia con ese nombre en esta familia"
        )

    nueva = Subfamilia(
        nombre=nombre,
        familia_id=subfamilia.familia_id
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return nueva


@router.put("/{subfamilia_id}", response_model=SubfamiliaResponse)
def actualizar_subfamilia(
    subfamilia_id: int,
    data: SubfamiliaUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subfamilia = db.query(Subfamilia).filter(
        Subfamilia.id == subfamilia_id
    ).first()

    if not subfamilia:
        raise HTTPException(status_code=404, detail="Subfamilia no encontrada")

    nuevo_nombre = data.nombre.strip() if data.nombre is not None else subfamilia.nombre
    nueva_familia_id = data.familia_id if data.familia_id is not None else subfamilia.familia_id

    if not nuevo_nombre:
        raise HTTPException(status_code=400, detail="El nombre de la subfamilia es obligatorio")

    familia = db.query(Familia).filter(Familia.id == nueva_familia_id).first()

    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")

    existe = db.query(Subfamilia).filter(
        Subfamilia.nombre.ilike(nuevo_nombre),
        Subfamilia.familia_id == nueva_familia_id,
        Subfamilia.id != subfamilia_id
    ).first()

    if existe:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una subfamilia con ese nombre en esta familia"
        )

    subfamilia.nombre = nuevo_nombre
    subfamilia.familia_id = nueva_familia_id

    db.commit()
    db.refresh(subfamilia)

    return subfamilia


@router.delete("/{subfamilia_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_subfamilia(
    subfamilia_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subfamilia = db.query(Subfamilia).filter(
        Subfamilia.id == subfamilia_id
    ).first()

    if not subfamilia:
        raise HTTPException(status_code=404, detail="Subfamilia no encontrada")

    tiene_productos = db.query(Producto).filter(
        Producto.subfamilia_id == subfamilia_id
    ).first()

    if tiene_productos:
        raise HTTPException(
            status_code=409,
            detail="No puedes eliminar esta subfamilia porque tiene productos asociados."
        )

    db.delete(subfamilia)
    db.commit()