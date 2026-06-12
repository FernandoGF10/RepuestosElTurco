import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

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

const Index = () => {
  const { addItem, setCartOpen, count } = useCart();

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [familiaActiva, setFamiliaActiva] =
    useState<number | null>(null);

  const [subfamiliaActiva, setSubfamiliaActiva] =
    useState<number | null>(null);

  const [selectedProducto, setSelectedProducto] =
    useState<ProductoAdmin | null>(null);

  useEffect(() => {
    Promise.all([
      api.familias.list(),
      api.subfamilias.list(),
    ])
        .then(([familiasData, subfamiliasData]: [Familia[], Subfamilia[]]) => {
          setFamilias(familiasData);
          setSubfamilias(subfamiliasData);
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

  const filteredProductos = useMemo(() => {
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
        r.compatibilidad.some((c) =>
          c.auto.toLowerCase().includes(term)
        );

      return (
        matchFamilia &&
        matchSubfamilia &&
        matchSearch
      );
    });
  }, [
    productos,
    familiaActiva,
    subfamiliaActiva,
    searchTerm,
  ]);

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

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.2em]">
                Catálogo
              </span>

              <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground">
                Repuestos y Accesorios
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <strong className="text-foreground">
                {filteredProductos.length}
              </strong>{" "}
              de {productos.length} repuestos
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">

            <button
              onClick={() => {
                setFamiliaActiva(null);
                setSubfamiliaActiva(null);
              }}
              className={`font-heading text-xs font-bold px-4 py-2 rounded-full transition-all ${
                familiaActiva === null
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              Todos
            </button>

            {familias.map((familia) => {
              const subs = subfamilias.filter(
                (s) => s.familia_id === familia.id
              );

              return (
                <div
                  key={familia.id}
                  className="relative group"
                >
                  <button
                    onClick={() => {
                      setFamiliaActiva(familia.id);
                      setSubfamiliaActiva(null);
                    }}
                    className={`font-heading text-xs font-bold px-4 py-2 rounded-full transition-all ${
                      familiaActiva === familia.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {familia.nombre}
                  </button>

                  {subs.length > 0 && (
                    <div className="absolute top-full left-0 min-w-[240px] bg-white rounded-xl border shadow-xl z-50 hidden group-hover:block">

                      {subs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setFamiliaActiva(familia.id);
                            setSubfamiliaActiva(sub.id);
                          }}
                          className={`block w-full text-left px-4 py-3 text-sm hover:bg-slate-100 transition ${
                            subfamiliaActiva === sub.id
                              ? "bg-blue-50 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          {sub.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                Intenta con otro término de búsqueda o categoría.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFamiliaActiva(null);
                  setSubfamiliaActiva(null);
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