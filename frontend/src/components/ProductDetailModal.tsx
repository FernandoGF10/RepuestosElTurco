import { X, Car, Info, Shield, ShoppingCart } from "lucide-react";
import type { ProductoAdmin } from "@/types/admin";

interface ProductDetailModalProps {
  producto: ProductoAdmin;
  onClose: () => void;
  onAgregarCarrito: (producto: ProductoAdmin) => void;
}

const ProductDetailModal = ({ producto, onClose, onAgregarCarrito }: ProductDetailModalProps) => {
  const formattedPrice = producto.precio.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  const enStock = producto.stock > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-muted/80 backdrop-blur rounded-full p-2 hover:bg-border transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Image section */}
        <div className="relative h-64 md:h-72 bg-gradient-to-b from-muted to-card flex items-center justify-center rounded-t-2xl">
          <img src={producto.imagen} alt={producto.nombre} className="h-48 w-48 object-contain" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-foreground/90 text-card text-xs font-mono font-bold px-3 py-1.5 rounded-md">
              {producto.codigo}
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-heading font-bold px-3 py-1.5 rounded-md uppercase">
              {producto.marca}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.15em]">
              {producto.categoria}
            </span>
            <h2 className="font-heading font-black text-2xl text-foreground">{producto.nombre}</h2>
            <p className="text-sm text-muted-foreground">Marca: <strong className="text-foreground">{producto.marca}</strong></p>
          </div>

          {/* Price + stock row */}
          <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
            <div className="flex-1">
              <span className="font-heading font-black text-3xl text-primary">{formattedPrice}</span>
              <p className="text-xs text-muted-foreground mt-0.5">Retiro en tienda · IVA incluido</p>
            </div>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                enStock ? "bg-whatsapp/15 text-whatsapp" : "bg-destructive/15 text-destructive"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${enStock ? "bg-whatsapp" : "bg-destructive"}`} />
              {enStock ? "En Stock" : "Sin Stock"}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-heading font-bold text-sm text-foreground">
              <Info className="w-4 h-4 text-primary" /> Descripción detallada
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{producto.detalle}</p>
          </div>

          {/* Compatibility table */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-heading font-bold text-sm text-foreground">
              <Car className="w-4 h-4 text-primary" /> Vehículos compatibles
            </h3>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left font-heading font-bold text-xs text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Vehículo</th>
                    <th className="text-left font-heading font-bold text-xs text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Años</th>
                  </tr>
                </thead>
                <tbody>
                  {producto.compatibilidad.map((comp) => (
                    <tr key={comp.auto} className="border-t border-border">
                      <td className="px-4 py-2.5 text-foreground font-medium">{comp.auto}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{comp.anios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-3 bg-accent/50 rounded-xl p-4 text-sm">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-heading font-bold text-foreground">Garantía incluida</p>
              <p className="text-muted-foreground text-xs">Compra online, reserva tu pedido y retíralo directamente en la tienda.</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => { onAgregarCarrito(producto); onClose(); }}
            disabled={!enStock}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold text-sm py-3.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {enStock ? "Agregar al carrito" : "Sin stock disponible"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
