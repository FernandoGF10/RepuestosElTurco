import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X, User, Phone, ChevronLeft, Loader2, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";
import type { ProductoAdmin } from "@/types/admin";
import { api } from "@/lib/api";

export type CartItem = { producto: ProductoAdmin; cantidad: number };

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onOrderSuccess: () => void;
}

interface ClienteForm {
  nombre: string;
  telefono: string;
  email: string;
}

const CartDrawer = ({
  open,
  items,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onOrderSuccess,
}: CartDrawerProps) => {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [cliente, setCliente] = useState<ClienteForm>({ nombre: "", telefono: "", email: "" });
  const [errors, setErrors] = useState<Partial<ClienteForm>>({});
  const [loading, setLoading] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");

  if (!open) return null;

  const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const totalFormatted = total.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  const handleClose = () => {
    setStep("cart");
    setCliente({ nombre: "", telefono: "", email: "" });
    setErrors({});
    setNumeroPedido("");
    onClose();
  };

  const validateCliente = (): boolean => {
    const e: Partial<ClienteForm> = {};
    if (!cliente.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!cliente.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else if (!/^\+?\d[\d\s-]{7,}$/.test(cliente.telefono.trim())) e.telefono = "Ingresa un teléfono válido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateCliente()) return;
    setLoading(true);
    try {
      const pedido = await api.pedidos.create({
        cliente: {
          nombre: cliente.nombre.trim(),
          telefono: cliente.telefono.trim(),
          email: cliente.email.trim() || undefined,
        },
        items: items.map((item) => ({
          producto_id: item.producto.id,
          codigo: item.producto.codigo,
          nombre: item.producto.nombre,
          marca: item.producto.marca,
          precio: item.producto.precio,
          cantidad: item.cantidad,
        })),
      });

      setNumeroPedido(pedido.numero);
      setStep("success");
      onOrderSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} className="p-1 rounded hover:bg-muted mr-1">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="font-heading font-black text-lg text-foreground">
                {step === "cart" ? "Carrito de compras" : step === "checkout" ? "Datos del comprador" : "¡Pedido confirmado!"}
              </p>
              {step !== "success" && (
                <p className="text-sm text-muted-foreground">Retiro exclusivo en tienda</p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Empty state */}
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
        ) : step === "success" ? (
          /* Success screen */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-black text-xl text-foreground">¡Pedido registrado!</h3>
              <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-lg text-primary">{numeroPedido}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Tu pedido fue recibido y está siendo procesado. Puedes pasar a retirarlo cuando esté listo.
              </p>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/60 rounded-xl px-4 py-3 max-w-xs">
              Guarda el número de pedido para hacer seguimiento. El equipo de la tienda lo preparará a la brevedad.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-primary text-primary-foreground font-heading font-bold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
            >
              Seguir comprando
            </button>
          </div>
        ) : step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.map((item) => {
                const subtotal = (item.producto.precio * item.cantidad).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                });

                return (
                  <div key={item.producto.id} className="border border-border rounded-2xl p-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0">
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-heading font-bold uppercase tracking-wider">
                          {item.producto.codigo}
                        </p>
                        <h4 className="font-heading font-bold text-sm text-foreground leading-tight">
                          {item.producto.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground">{item.producto.marca}</p>
                        <p className="font-heading font-black text-primary mt-1">{subtotal}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDecrease(item.producto.id)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-6 text-center font-heading font-bold text-foreground">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onIncrease(item.producto.id)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemove(item.producto.id)}
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
                <button
                  onClick={() => setStep("checkout")}
                  className="sm:order-2 bg-secondary text-secondary-foreground font-heading font-bold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  Confirmar pedido
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Checkout step */
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <p className="text-sm text-muted-foreground">
                Ingresa tus datos para registrar el pedido. Te contactaremos por WhatsApp para coordinar el retiro.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5" /> Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={cliente.nombre}
                    onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))}
                    placeholder="Ej: Carlos Pérez"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5" /> Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={cliente.telefono}
                    onChange={(e) => setCliente((c) => ({ ...c, telefono: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.telefono && <p className="text-xs text-destructive mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email (opcional)</label>
                  <input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => setCliente((c) => ({ ...c, email: e.target.value }))}
                    placeholder="tu@correo.cl"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-4 space-y-1">
                <p className="text-xs font-bold text-foreground">Resumen del pedido</p>
                {items.map((item) => (
                  <p key={item.producto.id} className="text-xs text-muted-foreground">
                    {item.producto.nombre} x{item.cantidad}
                  </p>
                ))}
                <p className="text-sm font-heading font-black text-primary pt-1">{totalFormatted}</p>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold text-sm py-3.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando pedido...</>
                ) : (
                  "Confirmar compra"
                )}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
