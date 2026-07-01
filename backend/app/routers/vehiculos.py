from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.marca import Marca
from app.models.modelo_auto import ModeloAuto
from app.models.motor_auto import MotorAuto
from app.models.usuario import Usuario
from app.schemas.vehiculo import (
    MarcaVehiculoOut,
    ModeloAutoCreate,
    ModeloAutoOut,
    MotorAutoCreate,
    MotorAutoOut,
)

router = APIRouter(prefix="/api/vehiculos", tags=["vehiculos"])


@router.get("/marcas", response_model=list[MarcaVehiculoOut])
def listar_marcas_vehiculo(
    solo_activas: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = db.query(Marca)

    if solo_activas:
        q = q.filter(Marca.activa == True)

    return q.order_by(Marca.nombre).all()


@router.get("/modelos", response_model=list[ModeloAutoOut])
def listar_modelos(
    marca_id: int | None = Query(None),
    solo_activos: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = db.query(ModeloAuto)

    if marca_id is not None:
        q = q.filter(ModeloAuto.marca_id == marca_id)

    if solo_activos:
        q = q.filter(ModeloAuto.activo == True)

    modelos = q.order_by(ModeloAuto.nombre).all()

    return [
        ModeloAutoOut(
            id=m.id,
            marca_id=m.marca_id,
            nombre=m.nombre,
            activo=m.activo,
            marca_nombre=m.marca.nombre if m.marca else None,
        )
        for m in modelos
    ]


@router.post("/modelos", response_model=ModeloAutoOut, status_code=status.HTTP_201_CREATED)
def crear_modelo(
    data: ModeloAutoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    marca = db.query(Marca).filter(Marca.id == data.marca_id).first()

    if not marca:
        raise HTTPException(status_code=404, detail="Marca no encontrada")

    modelo = ModeloAuto(**data.model_dump())
    db.add(modelo)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese modelo ya existe para esta marca")

    db.refresh(modelo)

    return ModeloAutoOut(
        id=modelo.id,
        marca_id=modelo.marca_id,
        nombre=modelo.nombre,
        activo=modelo.activo,
        marca_nombre=marca.nombre,
    )


@router.get("/motores", response_model=list[MotorAutoOut])
def listar_motores(
    modelo_id: int | None = Query(None),
    solo_activos: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = db.query(MotorAuto)

    if modelo_id is not None:
        q = q.filter(MotorAuto.modelo_id == modelo_id)

    if solo_activos:
        q = q.filter(MotorAuto.activo == True)

    motores = q.order_by(MotorAuto.nombre).all()

    return [
        MotorAutoOut(
            id=m.id,
            modelo_id=m.modelo_id,
            nombre=m.nombre,
            activo=m.activo,
            modelo_nombre=m.modelo.nombre if m.modelo else None,
        )
        for m in motores
    ]


@router.post("/motores", response_model=MotorAutoOut, status_code=status.HTTP_201_CREATED)
def crear_motor(
    data: MotorAutoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    modelo = db.query(ModeloAuto).filter(ModeloAuto.id == data.modelo_id).first()

    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")

    motor = MotorAuto(**data.model_dump())
    db.add(motor)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese motor ya existe para este modelo")

    db.refresh(motor)

    return MotorAutoOut(
        id=motor.id,
        modelo_id=motor.modelo_id,
        nombre=motor.nombre,
        activo=motor.activo,
        modelo_nombre=modelo.nombre,
    )


@router.delete("/modelos/{modelo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_modelo(
    modelo_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    modelo = db.query(ModeloAuto).filter(ModeloAuto.id == modelo_id).first()

    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")

    db.delete(modelo)
    db.commit()


@router.delete("/motores/{motor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_motor(
    motor_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    motor = db.query(MotorAuto).filter(MotorAuto.id == motor_id).first()

    if not motor:
        raise HTTPException(status_code=404, detail="Motor no encontrado")

    db.delete(motor)
    db.commit()