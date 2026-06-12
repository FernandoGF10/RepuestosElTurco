from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut, ProductoStockUpdate
import uuid

router = APIRouter(prefix="/api/productos", tags=["productos"])


# ── Público ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProductoOut])
def listar_productos(
    familia_id: int | None = Query(None),
    subfamilia_id: int | None = Query(None),
    buscar: str | None = Query(None),
    solo_activos: bool = Query(True),
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

    productos = q.order_by(Producto.nombre).all()

    resultado = []

    for p in productos:
        item = ProductoOut.model_validate(p)

        item.familia_nombre = (
            p.familia.nombre if p.familia else None
        )

        item.subfamilia_nombre = (
            p.subfamilia.nombre if p.subfamilia else None
        )

        resultado.append(item)

    return resultado


@router.get("/{producto_id}", response_model=ProductoOut)
def obtener_producto(producto_id: uuid.UUID, db: Session = Depends(get_db)):
    p = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p


# ── Admin ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    if db.query(Producto).filter(Producto.codigo == data.codigo).first():
        raise HTTPException(status_code=409, detail=f"Ya existe un producto con código {data.codigo}")

    p = Producto(
        **data.model_dump(exclude={"compatibilidad"}),
        compatibilidad=[c.model_dump() for c in data.compatibilidad],
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


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

    update_data = data.model_dump(exclude_unset=True)
    if "compatibilidad" in update_data and update_data["compatibilidad"] is not None:
        update_data["compatibilidad"] = [c.model_dump() for c in data.compatibilidad]

    # Verificar código único si se está cambiando
    if "codigo" in update_data:
        existing = db.query(Producto).filter(
            Producto.codigo == update_data["codigo"],
            Producto.id != producto_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Ya existe un producto con código {update_data['codigo']}")

    for key, value in update_data.items():
        setattr(p, key, value)

    db.commit()
    db.refresh(p)
    return p


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
    return p


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
    return p


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    from app.models.pedido import PedidoItem
    p = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # No eliminar si tiene pedidos asociados
    usado = db.query(PedidoItem).filter(PedidoItem.producto_id == str(producto_id)).first()
    if usado:
        raise HTTPException(
            status_code=409,
            detail="Este producto está asociado a pedidos. Sugerimos desactivarlo en lugar de eliminarlo.",
        )

    db.delete(p)
    db.commit()
