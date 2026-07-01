from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.pedido import PedidoItem
from app.models.marca import Marca
from app.models.modelo_auto import ModeloAuto
from app.models.motor_auto import MotorAuto
from app.models.producto_compatibilidad import ProductoCompatibilidad

from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoOut,
    ProductoStockUpdate,
    ProductoCompatibilidadCreate,
    ProductoCompatibilidadOut,
)

import uuid

router = APIRouter(prefix="/api/productos", tags=["productos"])


def validar_compatibilidad(
    db: Session,
    item: ProductoCompatibilidadCreate,
):
    marca = db.query(Marca).filter(Marca.id == item.marca_id).first()

    if not marca:
        raise HTTPException(status_code=404, detail="Marca de vehículo no encontrada")

    modelo = db.query(ModeloAuto).filter(
        ModeloAuto.id == item.modelo_id,
        ModeloAuto.marca_id == item.marca_id,
    ).first()

    if not modelo:
        raise HTTPException(
            status_code=400,
            detail="El modelo seleccionado no pertenece a la marca indicada",
        )

    motor = db.query(MotorAuto).filter(
        MotorAuto.id == item.motor_id,
        MotorAuto.modelo_id == item.modelo_id,
    ).first()

    if not motor:
        raise HTTPException(
            status_code=400,
            detail="El motor seleccionado no pertenece al modelo indicado",
        )

    if item.anio_hasta < item.anio_desde:
        raise HTTPException(
            status_code=400,
            detail="El año hasta no puede ser menor que el año desde",
        )

    return marca, modelo, motor


def construir_compatibilidades(
    db: Session,
    compatibilidades_auto: list[ProductoCompatibilidadCreate],
):
    relaciones = []
    compatibilidad_texto = []

    for item in compatibilidades_auto:
        marca, modelo, motor = validar_compatibilidad(db, item)

        relaciones.append(
            ProductoCompatibilidad(
                marca_id=item.marca_id,
                modelo_id=item.modelo_id,
                motor_id=item.motor_id,
                anio_desde=item.anio_desde,
                anio_hasta=item.anio_hasta,
            )
        )

        compatibilidad_texto.append(
            {
                "auto": f"{marca.nombre} {modelo.nombre} {motor.nombre}",
                "anios": f"{item.anio_desde}-{item.anio_hasta}",
            }
        )

    return relaciones, compatibilidad_texto


def producto_to_out(p: Producto) -> ProductoOut:
    item = ProductoOut.model_validate(p)

    item.familia_nombre = p.familia.nombre if p.familia else None
    item.subfamilia_nombre = p.subfamilia.nombre if p.subfamilia else None

    item.compatibilidades_auto = [
        ProductoCompatibilidadOut(
            id=c.id,
            marca_id=c.marca_id,
            modelo_id=c.modelo_id,
            motor_id=c.motor_id,
            anio_desde=c.anio_desde,
            anio_hasta=c.anio_hasta,
            marca_nombre=c.marca.nombre if c.marca else None,
            modelo_nombre=c.modelo.nombre if c.modelo else None,
            motor_nombre=c.motor.nombre if c.motor else None,
        )
        for c in p.compatibilidades_rel
    ]

    return item


# ── Público ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProductoOut])
def listar_productos(
    familia_id: int | None = Query(None),
    subfamilia_id: int | None = Query(None),
    buscar: str | None = Query(None),
    solo_activos: bool = Query(True),

    # Nuevos filtros para catálogo por vehículo
    marca_id: int | None = Query(None),
    modelo_id: int | None = Query(None),
    motor_id: int | None = Query(None),
    anio: int | None = Query(None),

    db: Session = Depends(get_db),
):
    q = db.query(Producto)

    if solo_activos:
        q = q.filter(Producto.activo == True)

    if familia_id is not None:
        q = q.filter(Producto.familia_id == familia_id)

    if subfamilia_id is not None:
        q = q.filter(Producto.subfamilia_id == subfamilia_id)

    if buscar:
        term = f"%{buscar}%"
        q = q.filter(
            or_(
                Producto.nombre.ilike(term),
                Producto.codigo.ilike(term),
                Producto.marca.ilike(term),
            )
        )

    # Filtros nuevos por vehículo
    if marca_id is not None or modelo_id is not None or motor_id is not None or anio is not None:
        q = q.join(ProductoCompatibilidad)

        if marca_id is not None:
            q = q.filter(ProductoCompatibilidad.marca_id == marca_id)

        if modelo_id is not None:
            q = q.filter(ProductoCompatibilidad.modelo_id == modelo_id)

        if motor_id is not None:
            q = q.filter(ProductoCompatibilidad.motor_id == motor_id)

        if anio is not None:
            q = q.filter(
                ProductoCompatibilidad.anio_desde <= anio,
                ProductoCompatibilidad.anio_hasta >= anio,
            )

        q = q.distinct()

    productos = q.order_by(Producto.nombre).all()

    return [producto_to_out(p) for p in productos]


@router.get("/{producto_id}", response_model=ProductoOut)
def obtener_producto(producto_id: uuid.UUID, db: Session = Depends(get_db)):
    p = db.query(Producto).filter(Producto.id == producto_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return producto_to_out(p)


# ── Admin ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    if db.query(Producto).filter(Producto.codigo == data.codigo).first():
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe un producto con código {data.codigo}",
        )

    producto_data = data.model_dump(
        exclude={
            "compatibilidad",
            "compatibilidades_auto",
        }
    )

    p = Producto(**producto_data)

    if data.compatibilidades_auto:
        relaciones, compatibilidad_texto = construir_compatibilidades(
            db,
            data.compatibilidades_auto,
        )

        p.compatibilidades_rel = relaciones
        p.compatibilidad = compatibilidad_texto
    else:
        p.compatibilidad = [c.model_dump() for c in data.compatibilidad]

    db.add(p)
    db.commit()
    db.refresh(p)

    return producto_to_out(p)


@router.put("/{producto_id}", response_model=ProductoOut)
def actualizar_producto(
    producto_id: uuid.UUID,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = data.model_dump(
        exclude_unset=True,
        exclude={
            "compatibilidad",
            "compatibilidades_auto",
        },
    )

    if "codigo" in update_data:
        existing = db.query(Producto).filter(
            Producto.codigo == update_data["codigo"],
            Producto.id != producto_id,
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Ya existe un producto con código {update_data['codigo']}",
            )

    for key, value in update_data.items():
        setattr(p, key, value)

    # Si viene compatibilidad nueva por selects
    if data.compatibilidades_auto is not None:
        db.query(ProductoCompatibilidad).filter(
            ProductoCompatibilidad.producto_id == producto_id
        ).delete(synchronize_session=False)

        relaciones, compatibilidad_texto = construir_compatibilidades(
            db,
            data.compatibilidades_auto,
        )

        p.compatibilidades_rel = relaciones
        p.compatibilidad = compatibilidad_texto

    # Si viene compatibilidad antigua por texto
    elif data.compatibilidad is not None:
        p.compatibilidad = [c.model_dump() for c in data.compatibilidad]

    db.commit()
    db.refresh(p)

    return producto_to_out(p)


@router.patch("/{producto_id}/stock", response_model=ProductoOut)
def actualizar_stock(
    producto_id: uuid.UUID,
    data: ProductoStockUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    p.stock = data.stock

    db.commit()
    db.refresh(p)

    return producto_to_out(p)


@router.patch("/{producto_id}/toggle", response_model=ProductoOut)
def toggle_activo(
    producto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    p.activo = not p.activo

    db.commit()
    db.refresh(p)

    return producto_to_out(p)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()

    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    usado = db.query(PedidoItem).filter(
        PedidoItem.producto_id == str(producto_id)
    ).first()

    if usado:
        raise HTTPException(
            status_code=409,
            detail="Este producto está asociado a pedidos. Sugerimos desactivarlo en lugar de eliminarlo.",
        )

    db.delete(p)
    db.commit()