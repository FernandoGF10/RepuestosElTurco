from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/repuestos_el_turco"
    SECRET_KEY: str = "cambia_esto_por_un_secreto_largo_y_aleatorio"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    ADMIN_USER: str = "admin"
    ADMIN_PASS: str = "turco2026"

    CORS_ORIGINS: str = "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://localhost:3000"

    # Mercado Pago (usa credenciales de prueba de tu cuenta de desarrollador
    # en https://www.mercadopago.cl/developers/panel/app para probar en local)
    MP_ACCESS_TOKEN: str = ""
    MP_PUBLIC_KEY: str = ""
    # URL pública donde Mercado Pago puede enviar el webhook (ngrok, etc).
    # En local sin túnel puede dejarse vacío: la verificación del pago se hace
    # igual desde la página de retorno (ver /api/pagos/verificar).
    MP_WEBHOOK_URL: str = ""
    # Origen del frontend, usado para construir las back_urls del checkout de MP
    FRONTEND_URL: str = "http://localhost:8080"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
