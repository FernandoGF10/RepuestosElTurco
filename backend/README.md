# Repuestos El Turco — Backend (FastAPI)

## Requisitos

- Python 3.11+
- PostgreSQL instalado y corriendo

---

## 1. Crear la base de datos en PostgreSQL

Abre psql o pgAdmin y ejecuta:

```sql
CREATE DATABASE repuestos_el_turco;
```

---

## 2. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Edita `.env` y cambia la contraseña de PostgreSQL:

```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/repuestos_el_turco
```

---

## 3. Instalar dependencias

```bash
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Mac/Linux)
source venv/bin/activate

# Instalar
pip install -r requirements.txt
```

---

## 4. Levantar el servidor

```bash
uvicorn app.main:app --reload
```

Al iniciar por primera vez:
- Se crean todas las tablas automáticamente
- Se crea el usuario admin (`admin` / `turco2026`)

---

## 5. Documentación interactiva

Con el servidor corriendo, abre en el navegador:

```
http://localhost:8000/docs
```

Ahí puedes probar todos los endpoints directamente.

---

## Endpoints disponibles

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login, devuelve JWT |
| GET | `/api/auth/me` | Info del usuario autenticado |

### Productos
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/productos` | Público | Listar (filtros: categoria, buscar) |
| GET | `/api/productos/{id}` | Público | Detalle |
| POST | `/api/productos` | Admin | Crear |
| PUT | `/api/productos/{id}` | Admin | Actualizar completo |
| PATCH | `/api/productos/{id}/stock` | Admin | Solo actualizar stock |
| PATCH | `/api/productos/{id}/toggle` | Admin | Activar/desactivar |
| DELETE | `/api/productos/{id}` | Admin | Eliminar (falla si tiene pedidos) |

### Pedidos
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/pedidos` | Público | Crear pedido (desde el carrito) |
| GET | `/api/pedidos` | Admin | Listar (filtros: estado, buscar) |
| GET | `/api/pedidos/{id}` | Admin | Detalle |
| PATCH | `/api/pedidos/{id}/estado` | Admin | Cambiar estado |

### Clientes
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/clientes` | Admin | Listado agrupado por teléfono |

### Reportes
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/reportes?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | Admin | Métricas del período |

### Configuración
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/config` | Público | Datos del negocio |
| PUT | `/api/config` | Admin | Actualizar datos |

---

## Cómo autenticarse en los endpoints admin

1. Llama a `POST /api/auth/login` con `{"username": "admin", "password": "turco2026"}`
2. Copia el `access_token` de la respuesta
3. En `/docs`, haz clic en el botón **Authorize** (arriba a la derecha) y pega el token

---

## Estructura del proyecto

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py       # Variables de entorno
│   │   ├── database.py     # Conexión SQLAlchemy
│   │   └── security.py     # JWT y hashing
│   ├── models/             # Tablas de la base de datos
│   │   ├── usuario.py
│   │   ├── producto.py
│   │   ├── pedido.py
│   │   └── config.py
│   ├── schemas/            # Validación Pydantic
│   │   ├── auth.py
│   │   ├── producto.py
│   │   ├── pedido.py
│   │   └── config.py
│   ├── routers/            # Endpoints
│   │   ├── auth.py
│   │   ├── productos.py
│   │   ├── pedidos.py
│   │   ├── clientes.py
│   │   ├── reportes.py
│   │   └── config.py
│   └── main.py             # App principal
├── requirements.txt
├── .env.example
└── README.md
```
