import { Eye, Car, ShoppingCart } from "lucide-react";
import type { ProductoAdmin } from "@/types/admin";

interface ProductCardProps {
  producto: ProductoAdmin;
  onVerMas: (producto: ProductoAdmin) => void;
  onAgregarCarrito: (producto: ProductoAdmin) => void;
}

const ProductCard = ({ producto, onVerMas, onAgregarCarrito }: ProductCardProps) => {
  const formattedPrice = producto.precio.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  const enStock = producto.stock > 0;

  return (
    <div className="group bg-card rounded-xl border border-border hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-b from-muted to-card flex items-center justify-center p-4 overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          className="h-40 w-40 object-contain group-hover:scale-110 transition-transform duration-500"
        />
        {!enStock && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Sin Stock
          </span>
        )}
        <span className="absolute top-3 left-3 bg-foreground/90 text-card text-[10px] font-mono font-bold px-2 py-1 rounded-md">
          {producto.codigo}
        </span>
        <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-[10px] font-heading font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          {producto.marca}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-[10px] text-muted-foreground font-heading font-bold uppercase tracking-[0.15em]">
          {producto.categoria}
        </span>
        <h3 className="font-heading font-bold text-foreground text-sm leading-tight">
          {producto.nombre}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
          {producto.descripcion}
        </p>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
          <Car className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {producto.compatibilidad.map((c) => c.auto).join(" · ")}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div>
            <span className="font-heading font-black text-lg text-primary leading-none block">
              {formattedPrice}
            </span>
            <span className="text-[10px] text-muted-foreground">Retiro en tienda · IVA incluido</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onVerMas(producto)}
              className="inline-flex items-center justify-center gap-1.5 border border-border text-foreground font-heading font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-muted active:scale-95 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver más
            </button>
            <button
              onClick={() => onAgregarCarrito(producto)}
              disabled={!enStock}
              className="inline-flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground font-heading font-bold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
