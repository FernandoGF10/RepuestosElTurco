from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.config import Config
from app.models.usuario import Usuario
from app.schemas.config import ConfigOut, ConfigUpdate

router = APIRouter(prefix="/api/config", tags=["config"])


def _get_or_create(db: Session) -> Config:
    c = db.query(Config).filter(Config.id == 1).first()
    if not c:
        c = Config(id=1)
        db.add(c)
        db.commit()
        db.refresh(c)
    return c


@router.get("", response_model=ConfigOut)
def obtener_config(db: Session = Depends(get_db)):
    """Público — el frontend lo necesita para el footer y WhatsApp."""
    return _get_or_create(db)


@router.put("", response_model=ConfigOut)
def actualizar_config(
    data: ConfigUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    c = _get_or_create(db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(c, key, value)
    db.commit()
    db.refresh(c)
    return c
