from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="admin")  # admin | vendedor
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
