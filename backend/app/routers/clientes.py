from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.pedido import Pedido, EstadoPedido
from app.models.usuario import Usuario
from app.schemas.config import ClienteResumen

router = APIRouter(prefix="/api/clientes", tags=["clientes"])


@router.get("", response_model=list[ClienteResumen])
def listar_clientes(
    buscar: str | None = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    pedidos = db.query(Pedido).filter(Pedido.estado != EstadoPedido.cancelado).all()

    # Agrupar por teléfono
    clientes: dict[str, dict] = {}
    for p in pedidos:
        tel = p.cliente_telefono
        if tel not in clientes:
            clientes[tel] = {
                "nombre": p.cliente_nombre,
                "telefono": tel,
                "email": p.cliente_email or "",
                "total_pedidos": 0,
                "total_gastado": 0,
                "ultimo_pedido": p.fecha.isoformat(),
            }
        c = clientes[tel]
        c["total_pedidos"] += 1
        c["total_gastado"] += p.total
        if p.fecha.isoformat() > c["ultimo_pedido"]:
            c["ultimo_pedido"] = p.fecha.isoformat()
            c["nombre"] = p.cliente_nombre  # actualizar con nombre más reciente

    result = list(clientes.values())
    result.sort(key=lambda x: x["total_gastado"], reverse=True)

    if buscar:
        t = buscar.lower()
        result = [c for c in result if t in c["nombre"].lower() or t in c["telefono"]]

    return result
