from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.pedido import Pedido, EstadoPedido
from app.models.usuario import Usuario
from app.schemas.config import ReporteOut, TopProducto

router = APIRouter(prefix="/api/reportes", tags=["reportes"])


@router.get("", response_model=ReporteOut)
def reporte_ventas(
    desde: str = Query(..., description="Fecha inicio YYYY-MM-DD"),
    hasta: str = Query(..., description="Fecha fin YYYY-MM-DD"),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    fecha_desde = datetime.fromisoformat(desde + "T00:00:00").replace(tzinfo=timezone.utc)
    fecha_hasta = datetime.fromisoformat(hasta + "T23:59:59").replace(tzinfo=timezone.utc)

    pedidos = (
        db.query(Pedido)
        .options(joinedload(Pedido.items))
        .filter(
            Pedido.fecha >= fecha_desde,
            Pedido.fecha <= fecha_hasta,
            Pedido.estado != EstadoPedido.cancelado,
        )
        .all()
    )

    total_ventas = sum(p.total for p in pedidos)
    cant_pedidos = len(pedidos)
    ticket_promedio = total_ventas // cant_pedidos if cant_pedidos else 0
    total_unidades = sum(i.cantidad for p in pedidos for i in p.items)

    # Top productos
    producto_map: dict[str, dict] = {}
    for p in pedidos:
        for item in p.items:
            pid = item.producto_id
            if pid not in producto_map:
                producto_map[pid] = {
                    "producto_id": pid,
                    "codigo": item.codigo,
                    "nombre": item.nombre,
                    "cantidad": 0,
                    "total": 0,
                }
            producto_map[pid]["cantidad"] += item.cantidad
            producto_map[pid]["total"] += item.precio * item.cantidad

    top = sorted(producto_map.values(), key=lambda x: x["cantidad"], reverse=True)[:10]

    return ReporteOut(
        total_ventas=total_ventas,
        cant_pedidos=cant_pedidos,
        ticket_promedio=ticket_promedio,
        total_unidades=total_unidades,
        top_productos=[TopProducto(**p) for p in top],
    )
