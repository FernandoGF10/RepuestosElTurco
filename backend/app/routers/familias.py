from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.security import require_admin
from app.models.familia import Familia
from app.models.subfamilia import Subfamilia
from app.models.producto import Producto
from app.schemas.familia import (
    FamiliaCreate,
    FamiliaUpdate,
    FamiliaOrdenItem,
    FamiliaResponse,
)

router = APIRouter(
    prefix="/api/familias",
    tags=["Familias"]
)


@router.get("/", response_model=list[FamiliaResponse])
def obtener_familias(db: Session = Depends(get_db)):
    return db.query(Familia).order_by(Familia.posicion.asc(), Familia.nombre.asc()).all()


@router.post("/", response_model=FamiliaResponse, status_code=status.HTTP_201_CREATED)
def crear_familia(
    familia: FamiliaCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    nombre = familia.nombre.strip()

    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre de la familia es obligatorio")

    existe = db.query(Familia).filter(Familia.nombre.ilike(nombre)).first()

    if existe:
        raise HTTPException(status_code=409, detail="Ya existe una familia con ese nombre")

    posicion = familia.posicion

    if posicion is None:
        ultima_posicion = db.query(func.max(Familia.posicion)).scalar() or 0
        posicion = ultima_posicion + 1

    nueva = Familia(
        nombre=nombre,
        imagen=familia.imagen or "",
        posicion=posicion,
    )

    db.add(nueva)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ya existe una familia con ese nombre")

    db.refresh(nueva)
    return nueva


@router.patch("/orden", response_model=list[FamiliaResponse])
def actualizar_orden_familias(
    orden: list[FamiliaOrdenItem],
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if not orden:
        return db.query(Familia).order_by(Familia.posicion.asc(), Familia.nombre.asc()).all()

    ids = [item.id for item in orden]

    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=400, detail="Hay familias repetidas en el orden enviado")

    familias = db.query(Familia).filter(Familia.id.in_(ids)).all()

    if len(familias) != len(ids):
        raise HTTPException(status_code=404, detail="Una o más familias no existen")

    familias_por_id = {familia.id: familia for familia in familias}

    for item in orden:
        familias_por_id[item.id].posicion = item.posicion

    db.commit()

    return db.query(Familia).order_by(Familia.posicion.asc(), Familia.nombre.asc()).all()


@router.put("/{familia_id}", response_model=FamiliaResponse)
def actualizar_familia(
    familia_id: int,
    data: FamiliaUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    familia = db.query(Familia).filter(Familia.id == familia_id).first()

    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")

    if data.nombre is not None:
        nombre = data.nombre.strip()

        if not nombre:
            raise HTTPException(status_code=400, detail="El nombre de la familia es obligatorio")

        existe = db.query(Familia).filter(
            Familia.nombre.ilike(nombre),
            Familia.id != familia_id
        ).first()

        if existe:
            raise HTTPException(status_code=409, detail="Ya existe una familia con ese nombre")

        familia.nombre = nombre

    if data.imagen is not None:
        familia.imagen = data.imagen

    if data.posicion is not None:
        familia.posicion = data.posicion

    db.commit()
    db.refresh(familia)

    return familia


@router.delete("/{familia_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_familia(
    familia_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    familia = db.query(Familia).filter(Familia.id == familia_id).first()

    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")

    tiene_subfamilias = db.query(Subfamilia).filter(
        Subfamilia.familia_id == familia_id
    ).first()

    if tiene_subfamilias:
        raise HTTPException(
            status_code=409,
            detail="No puedes eliminar esta familia porque tiene subfamilias asociadas. Elimina o cambia esas subfamilias primero."
        )

    tiene_productos = db.query(Producto).filter(
        Producto.familia_id == familia_id
    ).first()

    if tiene_productos:
        raise HTTPException(
            status_code=409,
            detail="No puedes eliminar esta familia porque tiene productos asociados."
        )

    db.delete(familia)
    db.commit()
