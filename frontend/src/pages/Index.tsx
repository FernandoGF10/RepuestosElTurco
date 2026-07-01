import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Wrench, LayoutGrid, Car, X } from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import BrandStrip from "@/components/BrandStrip";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SiteFooter from "@/components/SiteFooter";

import { api } from "@/lib/api";
import { useCart } from "@/lib/cartContext";

import type { ProductoAdmin } from "@/types/admin";

interface Familia {
  id: number;
  nombre: string;
  imagen?: string;
}

interface Subfamilia {
  id: number;
  nombre: string;
  familia_id: number;
}

interface MarcaVehiculo {
  id: number;
  nombre: string;
  logo?: string;
  activa?: boolean;
}

interface ModeloAuto {
  id: number;
  marca_id: number;
  nombre: string;
  activo: boolean;
  marca_nombre?: string;
}

interface MotorAuto {
  id: number;
  modelo_id: number;
  nombre: string;
  activo: boolean;
  modelo_nombre?: string;
}

const Index = () => {
  const { addItem, setCartOpen, count } = useCart();

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);

  const [marcasVehiculo, setMarcasVehiculo] = useState<MarcaVehiculo[]>([]);
  const [modelosVehiculo, setModelosVehiculo] = useState<ModeloAuto[]>([]);
  const [motoresVehiculo, setMotoresVehiculo] = useState<MotorAuto[]>([]);

  const [marcaVehiculoActiva, setMarcaVehiculoActiva] = useState<number | null>(null);
  const [modeloVehiculoActivo, setModeloVehiculoActivo] = useState<number | null>(null);
  const [motorVehiculoActivo, setMotorVehiculoActivo] = useState<number | null>(null);
  const [anioVehiculoActivo, setAnioVehiculoActivo] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [familiaActiva, setFamiliaActiva] = useState<number | null>(null);
  const [subfamiliaActiva, setSubfamiliaActiva] = useState<number | null>(null);

  const [selectedProducto, setSelectedProducto] = useState<ProductoAdmin | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [openFamiliaId, setOpenFamiliaId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubmenu = (familiaId: number, target: HTMLElement) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);

    const rect = target.getBoundingClientRect();

    setMenuPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });

    setOpenFamiliaId(familiaId);
  };

  const scheduleCloseSubmenu = () => {
    closeTimeout.current = setTimeout(() => setOpenFamiliaId(null), 150);
  };

  const cancelCloseSubmenu = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  useEffect(() => {
    Promise.all([
      api.familias.list(),
      api.subfamilias.list(),
      api.vehiculos.marcas(),
    ])
      .then(([familiasData, subfamiliasData, marcasData]) => {
        setFamilias(familiasData as Familia[]);
        setSubfamilias(subfamiliasData as Subfamilia[]);
        setMarcasVehiculo(marcasData as MarcaVehiculo[]);
      })
      .catch(() => {
        toast.error("No se pudieron cargar las categorías.");
      });
  }, []);

  useEffect(() => {
    api.productos
      .list({ solo_activos: true })
      .then(setProductos)
      .catch(() => {
        toast.error("No se pudieron cargar los productos.");
      });
  }, []);

  useEffect(() => {
    if (!marcaVehiculoActiva) {
      setModelosVehiculo([]);
      setModeloVehiculoActivo(null);
      setMotorVehiculoActivo(null);
      setMotoresVehiculo([]);
      return;
    }

    api.vehiculos
      .modelos(marcaVehiculoActiva)
      .then((data) => {
        setModelosVehiculo(data as ModeloAuto[]);
      })
      .catch(() => {
        toast.error("No se pudieron cargar los modelos.");
      });
  }, [marcaVehiculoActiva]);

  useEffect(() => {
    if (!modeloVehiculoActivo) {
      setMotoresVehiculo([]);
      setMotorVehiculoActivo(null);
      return;
    }

    api.vehiculos
      .motores(modeloVehiculoActivo)
      .then((data) => {
        setMotoresVehiculo(data as MotorAuto[]);
      })
      .catch(() => {
        toast.error("No se pudieron cargar los motores.");
      });
  }, [modeloVehiculoActivo]);

  const filteredProductos = useMemo(() => {
    const anioFiltro = anioVehiculoActivo ? Number(anioVehiculoActivo) : null;

    return productos.filter((r) => {
      const matchFamilia =
        familiaActiva === null ||
        r.familia_id === familiaActiva;

      const matchSubfamilia =
        subfamiliaActiva === null ||
        r.subfamilia_id === subfamiliaActiva;

      const term = searchTerm.toLowerCase();

      const matchSearch =
        !term ||
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        r.marca.toLowerCase().includes(term) ||
        (r.compatibilidad ?? []).some((c) =>
          c.auto.toLowerCase().includes(term)
        );

      const tieneFiltroVehiculo =
        marcaVehiculoActiva !== null ||
        modeloVehiculoActivo !== null ||
        motorVehiculoActivo !== null ||
        anioFiltro !== null;

      const matchVehiculo =
        !tieneFiltroVehiculo ||
        (r.compatibilidades_auto ?? []).some((c) => {
          const matchMarca =
            marcaVehiculoActiva === null ||
            c.marca_id === marcaVehiculoActiva;

          const matchModelo =
            modeloVehiculoActivo === null ||
            c.modelo_id === modeloVehiculoActivo;

          const matchMotor =
            motorVehiculoActivo === null ||
            c.motor_id === motorVehiculoActivo;

          const matchAnio =
            anioFiltro === null ||
            (c.anio_desde <= anioFiltro && c.anio_hasta >= anioFiltro);

          return matchMarca && matchModelo && matchMotor && matchAnio;
        });

      return (
        matchFamilia &&
        matchSubfamilia &&
        matchSearch &&
        matchVehiculo
      );
    });
  }, [
    productos,
    familiaActiva,
    subfamiliaActiva,
    searchTerm,
    marcaVehiculoActiva,
    modeloVehiculoActivo,
    motorVehiculoActivo,
    anioVehiculoActivo,
  ]);

  const hayFiltroVehiculo = Boolean(
    marcaVehiculoActiva ||
      modeloVehiculoActivo ||
      motorVehiculoActivo ||
      anioVehiculoActivo
  );

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const limpiarFiltroVehiculo = () => {
    setMarcaVehiculoActiva(null);
    setModeloVehiculoActivo(null);
    setMotorVehiculoActivo(null);
    setAnioVehiculoActivo("");
    setModelosVehiculo([]);
    setMotoresVehiculo([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={count}
        onOpenCart={() => setCartOpen(true)}
      />

      <HeroBanner />
      <BrandStrip />

      <section id="repuestos" className="py-12 flex-1">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.2em] leading-none">
                Catálogo
              </span>

              <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground leading-tight mt-1">
                Repuestos y Accesorios
              </h2>
            </div>

            <div className="w-full md:w-[420px]">
              <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
                      <Car className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs font-heading font-black uppercase tracking-[0.15em] text-foreground">
                        Filtrar por vehículo
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Encuentra repuestos 100% compatibles
                      </p>
                    </div>
                  </div>

                  {hayFiltroVehiculo && (
                    <button
                      type="button"
                      onClick={limpiarFiltroVehiculo}
                      className="flex items-center gap-1 shrink-0 text-[11px] font-heading font-bold text-primary hover:text-primary/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={marcaVehiculoActiva ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setMarcaVehiculoActiva(id || null);
                      setModeloVehiculoActivo(null);
                      setMotorVehiculoActivo(null);
                    }}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-all hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Marca</option>

                    {marcasVehiculo.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={modeloVehiculoActivo ?? ""}
                    disabled={!marcaVehiculoActiva}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setModeloVehiculoActivo(id || null);
                      setMotorVehiculoActivo(null);
                    }}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-all hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
                  >
                    <option value="">Modelo</option>

                    {modelosVehiculo.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={motorVehiculoActivo ?? ""}
                    disabled={!modeloVehiculoActivo}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setMotorVehiculoActivo(id || null);
                    }}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-all hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
                  >
                    <option value="">Motor</option>

                    {motoresVehiculo.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={anioVehiculoActivo}
                    onChange={(e) => setAnioVehiculoActivo(e.target.value)}
                    placeholder="Año"
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-all hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carrusel de familias con imagen */}
          <div className="relative mb-8 pb-5 border-b border-border md:px-11">
            <button
              type="button"
              onClick={() => scrollByAmount(-280)}
              aria-label="Desplazar a la izquierda"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollRef}
              onScroll={() => setOpenFamiliaId(null)}
              className="flex gap-3 overflow-x-auto pb-1 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                onClick={() => {
                  setFamiliaActiva(null);
                  setSubfamiliaActiva(null);
                }}
                className={`relative flex-shrink-0 snap-start flex flex-col items-center pt-5 px-2 gap-3 w-[124px] h-[148px] rounded-2xl border transition-all duration-200 ${
                  familiaActiva === null
                    ? "border-primary/40 bg-gradient-to-b from-primary/10 to-primary/5 shadow-lg shadow-primary/10 -translate-y-0.5"
                    : "border-border/70 bg-card hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    familiaActiva === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <LayoutGrid className="w-6 h-6" />
                </div>

                <span
                  className={`text-xs font-heading font-bold text-center leading-tight h-7 flex items-center justify-center ${
                    familiaActiva === null ? "text-primary" : "text-foreground"
                  }`}
                >
                  Todos
                </span>

                {familiaActiva === null && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-primary" />
                )}
              </button>

              {familias.map((familia) => {
                const subs = subfamilias.filter(
                  (s) => s.familia_id === familia.id
                );

                const isActive = familiaActiva === familia.id;

                return (
                  <div
                    key={familia.id}
                    className="relative flex-shrink-0"
                    onMouseEnter={(e) => {
                      if (subs.length > 0) {
                        openSubmenu(familia.id, e.currentTarget);
                      }
                    }}
                    onMouseLeave={() => {
                      if (subs.length > 0) scheduleCloseSubmenu();
                    }}
                  >
                    <button
                      onClick={() => {
                        setFamiliaActiva(familia.id);
                        setSubfamiliaActiva(null);
                      }}
                      className={`flex flex-col items-center pt-5 px-2 gap-3 w-[124px] h-[148px] rounded-2xl border transition-all duration-200 snap-start ${
                        isActive
                          ? "border-primary/40 bg-gradient-to-b from-primary/10 to-primary/5 shadow-lg shadow-primary/10 -translate-y-0.5"
                          : "border-border/70 bg-card hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center ring-2 transition-all ${
                          isActive
                            ? "ring-primary/30 bg-primary/10"
                            : "ring-transparent bg-muted"
                        }`}
                      >
                        {familia.imagen ? (
                          <img
                            src={familia.imagen}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Wrench className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      <span
                        className={`text-xs font-heading font-bold text-center leading-tight line-clamp-2 h-7 flex items-center justify-center ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {familia.nombre}
                      </span>

                      {isActive && (
                        <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollByAmount(280)}
              aria-label="Desplazar a la derecha"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {openFamiliaId !== null && menuPos && (() => {
              const familiaAbierta = familias.find((f) => f.id === openFamiliaId);

              const subsAbiertas = subfamilias.filter(
                (s) => s.familia_id === openFamiliaId
              );

              if (!familiaAbierta || subsAbiertas.length === 0) return null;

              return (
                <div
                  onMouseEnter={cancelCloseSubmenu}
                  onMouseLeave={scheduleCloseSubmenu}
                  style={{
                    position: "fixed",
                    top: menuPos.top,
                    left: menuPos.left,
                    transform: "translateX(-50%)",
                  }}
                  className="min-w-[220px] bg-white rounded-2xl border border-border shadow-2xl z-50 overflow-hidden py-1.5"
                >
                  {subsAbiertas.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setFamiliaActiva(familiaAbierta.id);
                        setSubfamiliaActiva(sub.id);
                        setOpenFamiliaId(null);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg mx-1.5 my-0.5 transition-colors ${
                        subfamiliaActiva === sub.id
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {sub.nombre}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {filteredProductos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductos.map((r) => (
                <ProductCard
                  key={r.id}
                  producto={r}
                  onVerMas={setSelectedProducto}
                  onAgregarCarrito={addItem}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>

              <p className="font-heading font-bold text-lg text-foreground">
                No se encontraron repuestos
              </p>

              <p className="text-sm text-muted-foreground">
                Intenta con otro término de búsqueda, categoría o vehículo.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFamiliaActiva(null);
                  setSubfamiliaActiva(null);
                  limpiarFiltroVehiculo();
                }}
                className="text-sm text-primary font-heading font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppButton />
      <CartDrawer />

      {selectedProducto && (
        <ProductDetailModal
          producto={selectedProducto}
          onClose={() => setSelectedProducto(null)}
          onAgregarCarrito={addItem}
        />
      )}
    </div>
  );
};

export default Index;