# Repuestos El Turco

Sistema web de venta de repuestos automotrices: catálogo público, carrito, checkout con Mercado Pago y panel de administración.

## Estructura del proyecto

```
RepuestosElTurco/
│
├── backend/          # API REST (FastAPI + SQLAlchemy + PostgreSQL)
├── frontend/          # Sitio público + panel admin (React + Vite)
├── database/          # Scripts SQL de la base de datos
│   ├── schema.sql                        # Estructura (tablas, índices, constraints), sin datos
│   ├── seed.sql                          # Datos de ejemplo/carga inicial
│   └── repuestos_el_turco_backup.sql     # Backup completo (schema + datos)
└── README.md
```

## Puesta en marcha

### 1. Base de datos

Crear la base y cargarla con uno de estos métodos:

```bash
createdb repuestos_el_turco

# Opción A: schema + datos de ejemplo por separado
psql -d repuestos_el_turco -f database/schema.sql
psql -d repuestos_el_turco -f database/seed.sql

# Opción B: restaurar el backup completo de una vez
psql -d repuestos_el_turco -f database/repuestos_el_turco_backup.sql
```

### 2. Backend

Ver [`backend/README.md`](backend/README.md) para instrucciones detalladas (variables de entorno, dependencias, endpoints).

```bash
cd backend
cp .env.example .env   # editar DATABASE_URL y credenciales
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT
- **Frontend**: React, Vite, TypeScript
- **Pagos**: Mercado Pago (Checkout Bricks)
