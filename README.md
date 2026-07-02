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

## Requisitos

Antes de empezar, instalar:

- **PostgreSQL** 14 o superior — https://www.postgresql.org/download/
- **Python** 3.11 o superior — https://www.python.org/downloads/
- **Node.js** 18 o superior — https://nodejs.org/

Elegí la sección de tu sistema operativo y seguila de punta a punta: [Linux](#instalación-en-linux) · [macOS](#instalación-en-macos) · [Windows](#instalación-en-windows)

---

## Instalación en Linux

Ejemplos para Debian/Ubuntu (`apt`). Si usás otra distro, instalá los mismos paquetes con tu gestor de paquetes (`dnf`, `pacman`, etc.).

### 1. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Comprobar que se instaló correctamente:

```bash
psql --version
```

### 2. Crear el usuario y la base de datos

PostgreSQL crea un usuario del sistema operativo llamado `postgres` durante la instalación. Usalo para crear tu propio rol:

```bash
sudo -u postgres psql -c "CREATE ROLE turco WITH LOGIN PASSWORD 'clave_segura' CREATEDB;"
sudo -u postgres createdb -O turco repuestos_el_turco
```

(Podés cambiar `turco` y `clave_segura` por lo que prefieras, pero después tenés que usar los mismos valores en el paso 4.)

### 3. Cargar la base de datos

Pará dentro de la carpeta del proyecto (`RepuestosElTurco/`) y ejecutá:

```bash
psql -U turco -d repuestos_el_turco -h localhost -f database/repuestos_el_turco_backup.sql
```

Te va a pedir la contraseña que definiste en el paso 2. Esto crea todas las tablas y carga los datos de ejemplo (106 productos, familias, subfamilias, etc.) de una sola vez.

### 4. Configurar y levantar el backend

```bash
cd backend
cp .env.example .env
```

Abrir el archivo `.env` con un editor de texto (`nano .env`, `gedit .env`, o el que prefieras) y ajustar la línea `DATABASE_URL` con los datos del paso 2:

```
DATABASE_URL=postgresql://turco:clave_segura@localhost:5432/repuestos_el_turco
```

Guardar el archivo y crear el entorno virtual de Python:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Si todo salió bien, el backend queda corriendo en http://localhost:8000 y podés ver la documentación interactiva en http://localhost:8000/docs

### 5. Levantar el frontend

Abrir **otra terminal** (dejando el backend corriendo en la anterior), pararse en la carpeta del proyecto y ejecutar:

```bash
cd frontend
npm install
npm run dev
```

El sitio queda disponible en http://localhost:8080

---

## Instalación en macOS

Se recomienda usar [Homebrew](https://brew.sh/) para instalar todo. Si no lo tenés instalado:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1. Instalar PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16
```

Homebrew no siempre agrega `psql` al PATH automáticamente. Comprobar si funciona:

```bash
psql --version
```

Si da error de "command not found", agregalo al PATH (ajustá el número de versión si instalaste otra):

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
psql --version
```

(Si usás bash en vez de zsh, cambiá `~/.zshrc` por `~/.bash_profile`.)

### 2. Crear la base de datos

En macOS con Homebrew, PostgreSQL usa por defecto tu propio usuario del sistema como rol de base de datos (no hace falta crear un usuario `postgres` aparte):

```bash
createdb repuestos_el_turco
```

Si preferís usar un usuario y contraseña específicos en vez de tu usuario del sistema:

```bash
psql postgres -c "CREATE ROLE turco WITH LOGIN PASSWORD 'clave_segura' CREATEDB;"
createdb -O turco repuestos_el_turco
```

### 3. Cargar la base de datos

Pará dentro de la carpeta del proyecto (`RepuestosElTurco/`):

```bash
# si usaste tu usuario del sistema (opción simple del paso 2):
psql -d repuestos_el_turco -f database/repuestos_el_turco_backup.sql

# si creaste el rol "turco" (opción alternativa del paso 2):
psql -U turco -d repuestos_el_turco -f database/repuestos_el_turco_backup.sql
```

Esto crea todas las tablas y carga los datos de ejemplo (106 productos, familias, subfamilias, etc.) de una sola vez.

### 4. Configurar y levantar el backend

```bash
cd backend
cp .env.example .env
```

Abrir el archivo `.env` (por ejemplo con `open -e .env` o tu editor favorito) y ajustar la línea `DATABASE_URL` según lo que usaste en el paso 2:

```
# si usaste tu usuario del sistema (sin contraseña):
DATABASE_URL=postgresql://localhost:5432/repuestos_el_turco

# si creaste el rol "turco":
DATABASE_URL=postgresql://turco:clave_segura@localhost:5432/repuestos_el_turco
```

Guardar el archivo y crear el entorno virtual de Python:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Si todo salió bien, el backend queda corriendo en http://localhost:8000 y podés ver la documentación interactiva en http://localhost:8000/docs

### 5. Levantar el frontend

Abrir **otra terminal** (dejando el backend corriendo en la anterior), pararse en la carpeta del proyecto y ejecutar:

```bash
cd frontend
npm install
npm run dev
```

El sitio queda disponible en http://localhost:8080

---

## Instalación en Windows

Se recomienda usar **PowerShell** (viene instalado por defecto). Todos los comandos de abajo funcionan también en CMD salvo que se indique lo contrario.

### 1. Instalar PostgreSQL

1. Descargar el instalador desde https://www.postgresql.org/download/windows/
2. Ejecutarlo. Durante la instalación:
   - Dejar tildada la opción **"Command Line Tools"** (incluye `psql`).
   - Va a pedir una contraseña para el usuario `postgres` — anotala, la vas a necesitar.
   - Dejar el puerto por defecto (`5432`).
3. Terminada la instalación, **cerrar y volver a abrir** PowerShell o CMD.
4. Comprobar que funciona:

```powershell
psql --version
```

Si dice que `psql` no se reconoce como comando:

1. Buscar **"Variables de entorno"** en el menú de inicio → abrir **"Editar las variables de entorno del sistema"**.
2. Click en el botón **"Variables de entorno..."**.
3. En la lista **"Variables del sistema"**, seleccionar la variable `Path` → **"Editar"** → **"Nuevo"**.
4. Agregar la ruta a la carpeta `bin` de PostgreSQL, por ejemplo:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```
5. Aceptar en todas las ventanas y **abrir una terminal nueva** (los cambios de PATH no aplican a terminales ya abiertas).
6. Verificar de nuevo: `psql --version`

### 2. Crear la base de datos

Abrir PowerShell y ejecutar (va a pedir la contraseña de `postgres` que definiste al instalar):

```powershell
psql -U postgres -c "CREATE ROLE turco WITH LOGIN PASSWORD 'clave_segura' CREATEDB;"
createdb -U postgres -O turco repuestos_el_turco
```

### 3. Cargar la base de datos

Pararse en la carpeta del proyecto (`RepuestosElTurco\`) y ejecutar:

```powershell
psql -U turco -d repuestos_el_turco -h localhost -f database\repuestos_el_turco_backup.sql
```

Esto crea todas las tablas y carga los datos de ejemplo (106 productos, familias, subfamilias, etc.) de una sola vez.

### 4. Configurar y levantar el backend

```powershell
cd backend

# PowerShell
Copy-Item .env.example .env

# si estás en CMD en vez de PowerShell, usá esto en su lugar:
copy .env.example .env
```

Abrir el archivo `.env` con el Bloc de notas (`notepad .env`) y ajustar la línea `DATABASE_URL`:

```
DATABASE_URL=postgresql://turco:clave_segura@localhost:5432/repuestos_el_turco
```

Guardar el archivo y crear el entorno virtual de Python:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> Si PowerShell bloquea la activación del entorno virtual con un error de "ejecución de scripts deshabilitada", ejecutar una vez (como administrador):
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> y volver a intentar `venv\Scripts\activate`.

Si todo salió bien, el backend queda corriendo en http://localhost:8000 y podés ver la documentación interactiva en http://localhost:8000/docs

### 5. Levantar el frontend

Abrir **otra terminal** (dejando el backend corriendo en la anterior), pararse en la carpeta del proyecto y ejecutar:

```powershell
cd frontend
npm install
npm run dev
```

El sitio queda disponible en http://localhost:8080

---

## Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT
- **Frontend**: React, Vite, TypeScript
- **Pagos**: Mercado Pago (Checkout Bricks)
