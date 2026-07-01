from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


from app.core.config import get_settings
from app.core.database import engine, Base
from app.core.security import hash_password
from app.routers import auth, productos, pedidos, pagos, clientes, reportes, config, usuarios, marcas, familias, subfamilias, vehiculos

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


def _seed_productos():
    """Siembra los 8 productos del catálogo inicial si la tabla está vacía."""
    from sqlalchemy.orm import Session
    from app.models.producto import Producto

    seed = [
        {"codigo": "AMG-001", "nombre": "Amortiguador Delantero", "categoria": "Suspensión", "marca": "Monroe",
         "precio": 45990, "stock": 10, "activo": True,
         "descripcion": "Amortiguador delantero hidráulico de doble acción, alta estabilidad y confort.",
         "detalle": "Amortiguador delantero hidráulico de doble acción con tecnología Safe-Tech. Diseñado para ofrecer estabilidad y confort en todo tipo de terreno. Fabricado con materiales de primera calidad, sello hermético para larga duración. Incluye tope de goma y guardapolvo. Garantía de 12 meses.",
         "compatibilidad": [{"auto": "Peugeot 206", "anios": "1998-2012"}, {"auto": "Peugeot 207", "anios": "2006-2015"}, {"auto": "Citroën C3", "anios": "2002-2016"}],
         "imagen_url": ""},
        {"codigo": "RAD-002", "nombre": "Radiador de Calefacción", "categoria": "Calefacción", "marca": "Valeo",
         "precio": 32500, "stock": 10, "activo": True,
         "descripcion": "Radiador de calefacción interior aluminio/cobre, calefacción eficiente.",
         "detalle": "Radiador de calefacción fabricado en aluminio y cobre de alta conductividad térmica. Proporciona calefacción eficiente para el habitáculo del vehículo. Fácil instalación, sellado hermético y alta durabilidad. Certificación OEM.",
         "compatibilidad": [{"auto": "Peugeot 308", "anios": "2007-2021"}, {"auto": "Peugeot 408", "anios": "2010-2022"}, {"auto": "Citroën C4", "anios": "2004-2020"}],
         "imagen_url": ""},
        {"codigo": "TDD-003", "nombre": "Terminal de Dirección", "categoria": "Dirección", "marca": "TRW",
         "precio": 18900, "stock": 10, "activo": True,
         "descripcion": "Terminal de dirección acero forjado con rótula de alta resistencia.",
         "detalle": "Terminal de dirección de acero forjado con rótula de alta resistencia y articulación sellada. Garantiza precisión y seguridad en la dirección del vehículo. Tratamiento anticorrosión. Cumple especificaciones del fabricante original.",
         "compatibilidad": [{"auto": "Renault Kangoo", "anios": "1997-2021"}, {"auto": "Renault Clio", "anios": "2005-2019"}, {"auto": "Renault Sandero", "anios": "2007-2020"}],
         "imagen_url": ""},
        {"codigo": "PFR-004", "nombre": "Pastillas de Freno Delanteras", "categoria": "Frenos", "marca": "Ferodo",
         "precio": 22500, "stock": 10, "activo": True,
         "descripcion": "Juego de pastillas semimetálicas de alto rendimiento, bajo ruido.",
         "detalle": "Pastillas de freno semimetálicas de alto rendimiento. Excelente frenado en seco y mojado. Baja generación de polvo y ruido. Cumple normas ECE R90. Incluye 4 pastillas por juego con indicador de desgaste.",
         "compatibilidad": [{"auto": "Chevrolet Corsa", "anios": "1994-2012"}, {"auto": "Chevrolet Agile", "anios": "2009-2014"}, {"auto": "Chevrolet Prisma", "anios": "2012-2020"}],
         "imagen_url": ""},
        {"codigo": "FLT-005", "nombre": "Filtro de Aceite", "categoria": "Filtros y Aceites", "marca": "Mann Filter",
         "precio": 8900, "stock": 0, "activo": True,
         "descripcion": "Filtro de aceite motor alta eficiencia, celulosa y fibra sintética.",
         "detalle": "Filtro de aceite con medio filtrante de celulosa y fibra sintética de alta eficiencia. Retiene partículas hasta de 20 micrones. Válvula antirretorno integrada para protección en arranque en frío. Calidad OEM.",
         "compatibilidad": [{"auto": "DFM Minivan", "anios": "2010-2023"}, {"auto": "Renault Logan", "anios": "2004-2022"}, {"auto": "Renault Symbol", "anios": "2008-2018"}],
         "imagen_url": ""},
        {"codigo": "BBA-006", "nombre": "Bobina de Encendido", "categoria": "Eléctrico", "marca": "Bosch",
         "precio": 35000, "stock": 10, "activo": True,
         "descripcion": "Bobina de encendido electrónica alto voltaje para sistemas de inyección.",
         "detalle": "Bobina de encendido de alto voltaje con núcleo ferromagnético de alta permeabilidad. Compatible con sistemas de encendido electrónico e inyección directa. Resistente a vibraciones y temperaturas extremas. Conector original incluido.",
         "compatibilidad": [{"auto": "Peugeot 208", "anios": "2012-2023"}, {"auto": "Citroën C3 Aircross", "anios": "2017-2023"}, {"auto": "Citroën Berlingo", "anios": "2008-2021"}],
         "imagen_url": ""},
        {"codigo": "CRR-007", "nombre": "Correa de Distribución", "categoria": "Motor", "marca": "Gates",
         "precio": 28700, "stock": 10, "activo": True,
         "descripcion": "Correa de distribución caucho HNBR reforzado con fibra de vidrio.",
         "detalle": "Correa de distribución fabricada en caucho HNBR con refuerzo de fibra de vidrio. Alta resistencia al desgaste, calor y aceites. Intervalo de cambio recomendado: 60.000 km o 4 años. Se recomienda cambiar junto con tensor y bomba de agua.",
         "compatibilidad": [{"auto": "Renault Duster", "anios": "2010-2023"}, {"auto": "Renault Fluence", "anios": "2009-2017"}, {"auto": "Renault Megane III", "anios": "2008-2016"}],
         "imagen_url": ""},
        {"codigo": "DSF-008", "nombre": "Disco de Freno Ventilado", "categoria": "Frenos", "marca": "Brembo",
         "precio": 38500, "stock": 10, "activo": True,
         "descripcion": "Disco de freno ventilado delantero, hierro fundido, alta disipación.",
         "detalle": "Disco de freno ventilado de hierro fundido gris de alta calidad. Diseño con aletas internas para óptima disipación del calor. Superficie rectificada de fábrica lista para instalar. Balanceado dinámicamente para evitar vibraciones.",
         "compatibilidad": [{"auto": "Chevrolet Cruze", "anios": "2009-2023"}, {"auto": "Chevrolet Tracker", "anios": "2013-2023"}, {"auto": "Chevrolet Onix", "anios": "2012-2023"}],
         "imagen_url": ""},
    ]

    with Session(engine) as db:
        if db.query(Producto).count() == 0:
            for data in seed:
                db.add(Producto(**data))
            db.commit()
            print(f"✅ {len(seed)} productos sembrados en la base de datos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas y usuario admin al iniciar
    import app.models  # noqa: importa todos los modelos para que Base los registre
    Base.metadata.create_all(bind=engine)
    _seed_admin()
    _seed_productos()
    yield


app = FastAPI(
    title="Repuestos El Turco — API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(pagos.router)
app.include_router(clientes.router)
app.include_router(reportes.router)
app.include_router(config.router)
app.include_router(usuarios.router)
app.include_router(marcas.router)
app.include_router(familias.router)
app.include_router(subfamilias.router)
app.include_router(vehiculos.router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "app": "Repuestos El Turco API"}
