from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, TokenResponse, UserInfo

router = APIRouter(prefix="/api/auth", tags=["auth"])


def autenticar_usuario(username: str, password: str, db: Session) -> Usuario:
    user = db.query(Usuario).filter(
        Usuario.username == username,
        Usuario.activo == True
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    return user


def crear_respuesta_token(user: Usuario) -> TokenResponse:
    token = create_access_token({"sub": user.username, "rol": user.rol})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        rol=user.rol,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = autenticar_usuario(data.username, data.password, db)
    return crear_respuesta_token(user)


@router.post("/token", response_model=TokenResponse)
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = autenticar_usuario(form_data.username, form_data.password, db)
    return crear_respuesta_token(user)


@router.get("/me", response_model=UserInfo)
def me(current_user: Usuario = Depends(get_current_user)):
    return UserInfo(username=current_user.username, rol=current_user.rol)