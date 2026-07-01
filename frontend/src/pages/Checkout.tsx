import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MapPin, Loader2, Tag, Phone, User, Mail, FileText, Store, CreditCard, Banknote, XCircle, ChevronLeft, Package } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { api } from "@/lib/api";
import MercadoPagoBrick from "@/components/MercadoPagoBrick";
import type { MetodoPago, Pedido } from "@/types/admin";

const logo = "/img/logo-el-turco.png";

const formatCLP = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });

interface ClienteForm {
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState<ClienteForm>({ nombre: "", telefono: "", email: "", notas: "" });
  const [errors, setErrors] = useState<Partial<ClienteForm>>({});
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("retiro_tienda");
  const [step, setStep] = useState<"datos" | "pago">("datos");
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);
  const [pagoError, setPagoError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground" />
        <h2 className="font-heading font-black text-xl text-foreground">Tu carrito está vacío</h2>
        <Link to="/" className="text-primary font-heading font-bold hover:underline text-sm">
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  const set = <K extends keyof ClienteForm>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Partial<ClienteForm> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    else if (!/^\+?\d[\d\s\-()]{6,}$/.test(form.telefono.trim()))
      e.telefono = "Ingresa un número de teléfono válido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const pedido = await api.pedidos.create({
        cliente: {
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim() || undefined,
        },
        items: items.map((item) => ({
          producto_id: item.producto.id,
          codigo: item.producto.codigo,
          nombre: item.producto.nombre,
          marca: item.producto.marca,
          precio: item.producto.precio,
          cantidad: item.cantidad,
        })),
        notas: form.notas.trim() || undefined,
        metodo_pago: metodoPago,
      });

      if (metodoPago === "mercado_pago") {
        setPedidoCreado(pedido);
        setStep("pago");
        return;
      }

      clearCart();
      navigate(`/pedido/${pedido.numero}`, { replace: true, state: { pedido } });
    } catch (err) {
      setErrors({ nombre: err instanceof Error ? err.message : "Error al procesar el pedido." });
    } finally {
      setLoading(false);
    }
  };

  const handlePagoAprobado = () => {
    if (!pedidoCreado) return;
    clearCart();
    navigate(`/pedido/${pedidoCreado.numero}`, {
      replace: true,
      state: { pedido: { ...pedidoCreado, estadoPago: "aprobado" as const } },
    });
  };

  const handlePagoRechazado = (motivo: string) => {
    setPagoError(motivo);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container flex items-center justify-between h-14 gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a la tienda</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-full" />
            <span className="font-heading font-black text-sm text-foreground">Repuestos El Turco</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
            <span>{items.reduce((s, i) => s + i.cantidad, 0)} productos</span>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">
            {step === "pago" ? "Pagar con Mercado Pago" : "Finalizar compra"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "pago"
              ? "Ingresa los datos de tu tarjeta. El pago se procesa aquí mismo, sin salir del sitio."
              : "Completa tus datos para confirmar el pedido."}
          </p>
        </div>

        {step === "pago" && pedidoCreado ? (
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep("datos");
                  setPagoError(null);
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Volver a mis datos
              </button>

              <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3">
                <Package className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Pedido</p>
                  <p className="font-mono font-black text-lg text-primary">{pedidoCreado.numero}</p>
                </div>
              </div>

              {pagoError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading font-bold">No se pudo procesar el pago</p>
                    <p className="text-xs mt-0.5 opacity-90">{pagoError} — puedes intentar nuevamente.</p>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-5">
                <MercadoPagoBrick
                  pedidoId={pedidoCreado.id}
                  amount={pedidoCreado.total}
                  payerEmail={form.email.trim()}
                  onAprobado={handlePagoAprobado}
                  onRechazado={handlePagoRechazado}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Resumen del pedido
                  </h2>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.producto.id} className="flex items-center gap-3 px-5 py-3">
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-12 h-12 rounded-lg object-contain bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm text-foreground truncate">{item.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</p>
                      </div>
                      <p className="font-heading font-bold text-sm text-foreground shrink-0">
                        {formatCLP(item.producto.precio * item.cantidad)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-4 bg-muted/30 flex justify-between font-heading font-black text-lg text-foreground">
                  <span>Total</span>
                  <span className="text-primary">{formatCLP(pedidoCreado.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">

            {/* ── Left: form ── */}
            <div className="space-y-4">

              {/* Datos personales */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Datos personales
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Nombre completo <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => set("nombre", e.target.value)}
                      placeholder="Ej: Carlos Pérez"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Teléfono <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => set("telefono", e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="tu@correo.cl"
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Método de entrega */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Método de entrega
                </h2>
                <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer">
                  <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary mt-0.5 shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <p className="font-heading font-bold text-sm text-foreground">Retiro en tienda</p>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Sin costo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Av. el Olimpo 1635, Local 4 · Santiago · Lun–Vie 9:00–18:00 | Sáb 10:00–14:00
                    </p>
                  </div>
                </label>
              </div>

              {/* Método de pago */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Método de pago
                </h2>

                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    metodoPago === "retiro_tienda"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    checked={metodoPago === "retiro_tienda"}
                    onChange={() => setMetodoPago("retiro_tienda")}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      metodoPago === "retiro_tienda" ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {metodoPago === "retiro_tienda" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      <p className="font-heading font-bold text-sm text-foreground">Pago en tienda</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Efectivo o transferencia al retirar tu pedido en el local.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    metodoPago === "mercado_pago"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo_pago"
                    checked={metodoPago === "mercado_pago"}
                    onChange={() => setMetodoPago("mercado_pago")}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      metodoPago === "mercado_pago" ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {metodoPago === "mercado_pago" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <p className="font-heading font-bold text-sm text-foreground">Mercado Pago</p>
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Online
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tarjeta de crédito, débito o saldo de Mercado Pago. Serás redirigido a pagar de forma segura.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notas */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Notas del pedido
                  <span className="text-muted-foreground font-normal text-sm">(opcional)</span>
                </h2>
                <textarea
                  value={form.notas}
                  onChange={(e) => set("notas", e.target.value)}
                  placeholder="Ej: Necesito los repuestos para el martes, o alguna indicación especial..."
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Submit mobile */}
              <div className="lg:hidden">
                <SubmitButton loading={loading} total={total} metodoPago={metodoPago} />
              </div>
            </div>

            {/* ── Right: order summary ── */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Resumen del pedido
                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                      {items.reduce((s, i) => s + i.cantidad, 0)} productos
                    </span>
                  </h2>
                </div>

                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.producto.id} className="flex items-center gap-3 px-5 py-3">
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-12 h-12 rounded-lg object-contain bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm text-foreground truncate">{item.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">{item.producto.marca} · {item.producto.codigo}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</p>
                      </div>
                      <p className="font-heading font-bold text-sm text-foreground shrink-0">
                        {formatCLP(item.producto.precio * item.cantidad)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="px-5 py-4 bg-muted/30 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCLP(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Envío</span>
                    <span className="text-emerald-600 font-bold">Gratis (retiro)</span>
                  </div>
                  <div className="flex justify-between font-heading font-black text-lg text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatCLP(total)}</span>
                  </div>
                </div>
              </div>

              {/* Submit desktop */}
              <div className="hidden lg:block">
                <SubmitButton loading={loading} total={total} metodoPago={metodoPago} />
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
                {metodoPago === "mercado_pago"
                  ? "A continuación vas a ingresar los datos de tu tarjeta aquí mismo, sin salir del sitio."
                  : "Al confirmar tu pedido aceptas que será preparado para retiro en tienda."}{" "}
                El equipo se pondrá en contacto si hay alguna consulta.
              </p>
            </div>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

const SubmitButton = ({
  loading,
  total,
  metodoPago,
}: {
  loading: boolean;
  total: number;
  metodoPago: MetodoPago;
}) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-heading font-black text-base py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-60 shadow-md"
  >
    {loading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        {metodoPago === "mercado_pago" ? "Preparando el pago..." : "Procesando pedido..."}
      </>
    ) : (
      <>
        {metodoPago === "mercado_pago" ? "Continuar al pago" : "Confirmar pedido"} ·{" "}
        {total.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
      </>
    )}
  </button>
);

export default Checkout;
