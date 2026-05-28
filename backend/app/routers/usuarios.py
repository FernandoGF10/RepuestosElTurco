from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioOut
import uuid

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return db.query(Usuario).order_by(Usuario.username).all()


@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(
    usuario_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return u


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    if db.query(Usuario).filter(Usuario.username == data.username).first():
        raise HTTPException(status_code=409, detail=f"Ya existe un usuario con nombre '{data.username}'")
    u = Usuario(
        username=data.username,
        hashed_password=hash_password(data.password),
        activo=data.activo,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(
    usuario_id: uuid.UUID,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current: Usuario = Depends(get_current_user),
):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.username is not None and data.username != u.username:
        if db.query(Usuario).filter(Usuario.username == data.username).first():
            raise HTTPException(status_code=409, detail=f"Ya existe un usuario con nombre '{data.username}'")
        u.username = data.username

    if data.password is not None:
        u.hashed_password = hash_password(data.password)

    if data.activo is not None:
        # No desactivar al único usuario activo
        activos = db.query(Usuario).filter(Usuario.activo == True).count()
        if not data.activo and activos <= 1 and u.activo:
            raise HTTPException(status_code=409, detail="No puedes desactivar al único usuario activo")
        u.activo = data.activo

    db.commit()
    db.refresh(u)
    return u


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: uuid.UUID,
    db: Session = Depends(get_db),
    current: Usuario = Depends(get_current_user),
):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if str(u.id) == str(current.id):
        raise HTTPException(status_code=409, detail="No puedes eliminar tu propio usuario")
    # No eliminar si es el único activo
    activos = db.query(Usuario).filter(Usuario.activo == True).count()
    if u.activo and activos <= 1:
        raise HTTPException(status_code=409, detail="No puedes eliminar al único usuario activo")
    db.delete(u)
    db.commit()
