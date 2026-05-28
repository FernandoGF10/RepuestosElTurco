import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Repuesto } from "@/data/repuestos";

export interface CartItem {
  repuesto: Repuesto;
  cantidad: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const CartDrawer = ({
  open,
  items,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
}: CartDrawerProps) => {
  if (!open) return null;

  const total = items.reduce((acc, item) => acc + item.repuesto.precio * item.cantidad, 0);
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalFormatted = total.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  const mensaje = encodeURIComponent(
    [
      "Hola, quiero comprar estos repuestos con retiro en tienda:",
      ...items.map(
        (item) => `- ${item.repuesto.nombre} (${item.repuesto.codigo}) x${item.cantidad}`,
      ),
      `Total estimado: ${totalFormatted}`,
      "Solicito retiro en tienda.",
    ].join("\n"),
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="font-heading font-black text-lg text-foreground">Carrito de compras</p>
            <p className="text-sm text-muted-foreground">Retiro exclusivo en tienda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Agrega repuestos y finaliza tu pedido online para retirarlo directamente en la tienda.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.map((item) => {
                const subtotal = (item.repuesto.precio * item.cantidad).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                });

                return (
                  <div key={item.repuesto.id} className="border border-border rounded-2xl p-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0">
                        <img
                          src={item.repuesto.imagen}
                          alt={item.repuesto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-wider">
                          {item.repuesto.codigo}
                        </p>
                        <h4 className="font-heading font-bold text-sm text-foreground leading-tight">
                          {item.repuesto.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground">{item.repuesto.marca}</p>
                        <p className="font-heading font-black text-primary mt-1">{subtotal}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDecrease(item.repuesto.id)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-6 text-center font-heading font-bold text-foreground">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onIncrease(item.repuesto.id)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemove(item.repuesto.id)}
                        className="inline-flex items-center gap-1 text-sm text-destructive hover:opacity-80 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" /> Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border px-5 py-4 space-y-4 bg-card">
              <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Productos</span>
                  <span className="font-semibold text-foreground">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-heading font-bold text-foreground">Total estimado</span>
                  <span className="font-heading font-black text-primary text-xl">{totalFormatted}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compra online y retira en tienda. No se calculan envíos en esta etapa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={onClear}
                  className="sm:order-1 border border-border text-foreground font-heading font-bold text-sm py-3 rounded-xl hover:bg-muted transition-colors"
                >
                  Vaciar carrito
                </button>
                <a
                  href={`https://wa.me/56977424442?text=${mensaje}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:order-2 text-center bg-secondary text-secondary-foreground font-heading font-bold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  Confirmar pedido
                </a>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
