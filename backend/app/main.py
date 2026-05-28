from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import engine, Base
from app.core.security import hash_password
from app.routers import auth, productos, pedidos, clientes, reportes, config

settings = get_settings()


def _seed_admin():
    """Crea el usuario admin si no existe."""
    from sqlalchemy.orm import Session
    from app.models.usuario import Usuario

    with Session(engine) as db:
        if not db.query(Usuario).filter(Usuario.username == settings.ADMIN_USER).first():
            db.add(Usuario(
                username=settings.ADMIN_USER,
                hashed_password=hash_password(settings.ADMIN_PASS),
            ))
            db.commit()
            print(f"✅ Usuario admin creado: {settings.ADMIN_USER}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas y usuario admin al iniciar
    import app.models  # noqa: importa todos los modelos para que Base los registre
    Base.metadata.create_all(bind=engine)
    _seed_admin()
    yield


app = FastAPI(
    title="Repuestos El Turco — API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(clientes.router)
app.include_router(reportes.router)
app.include_router(config.router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "app": "Repuestos El Turco API"}
