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
import { categorias } from "@/data/repuestos";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cartContext";
import type { ProductoAdmin } from "@/types/admin";

const Index = () => {
  const { addItem, setCartOpen, count } = useCart();
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [selectedProducto, setSelectedProducto] = useState<ProductoAdmin | null>(null);

  useEffect(() => {
    api.productos.list({ solo_activos: true }).then(setProductos).catch(() => {
      toast.error("No se pudieron cargar los productos.");
    });
  }, []);

  const filteredProductos = useMemo(() => {
    return productos.filter((r) => {
      const matchCategoria = categoriaActiva === "Todos" || r.categoria === categoriaActiva;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        r.nombre.toLowerCase().includes(term) ||
        r.codigo.toLowerCase().includes(term) ||
        r.categoria.toLowerCase().includes(term) ||
        r.marca.toLowerCase().includes(term) ||
        r.compatibilidad.some((c) => c.auto.toLowerCase().includes(term));
      return matchCategoria && matchSearch;
    });
  }, [searchTerm, categoriaActiva, productos]);

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

      {/* Catálogo */}
      <section id="repuestos" className="py-12 flex-1">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.2em]">Catálogo</span>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground">
                Repuestos y Accesorios
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Mostrando <strong className="text-foreground">{filteredProductos.length}</strong> de {productos.length} repuestos
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`font-heading text-xs font-bold px-4 py-2 rounded-full transition-all ${
                  categoriaActiva === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
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
              <p className="font-heading font-bold text-lg text-foreground">No se encontraron repuestos</p>
              <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda o categoría.</p>
              <button
                onClick={() => { setSearchTerm(""); setCategoriaActiva("Todos"); }}
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
