from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse, UserInfo

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(
        Usuario.username == data.username,
        Usuario.activo == True
    ).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    token = create_access_token({"sub": user.username, "rol": user.rol})
    return TokenResponse(access_token=token, username=user.username, rol=user.rol)


@router.get("/me", response_model=UserInfo)
def me(current_user: Usuario = Depends(get_current_user)):
    return UserInfo(username=current_user.username, rol=current_user.rol)
