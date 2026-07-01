import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Store, ArrowRight, Loader2, Clock, XCircle, CreditCard } from "lucide-react";
import logo from "../../public/img/logo-el-turco.png";
import { api } from "@/lib/api";
import type { Pedido, EstadoPago } from "@/types/admin";

const formatCLP = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });

const ESTADO_PAGO_UI: Record<
  EstadoPago,
  { label: string; desc: string; icon: typeof CheckCircle2; className: string }
> = {
  aprobado: {
    label: "Pago aprobado",
    desc: "Tu pago con Mercado Pago fue confirmado. ¡Gracias por tu compra!",
    icon: CheckCircle2,
    className: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  en_proceso: {
    label: "Pago en revisión",
    desc: "Mercado Pago está procesando tu pago. Te avisaremos cuando se confirme.",
    icon: Clock,
    className: "bg-amber-50 border-amber-200 text-amber-700",
  },
  pendiente: {
    label: "Pago pendiente",
    desc: "Aún no confirmamos tu pago. Si ya pagaste, puede tardar unos minutos en reflejarse.",
    icon: Clock,
    className: "bg-amber-50 border-amber-200 text-amber-700",
  },
  rechazado: {
    label: "Pago rechazado",
    desc: "Tu pago no pudo ser procesado. Contáctanos o intenta nuevamente desde el carrito.",
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-700",
  },
  no_aplica: {
    label: "",
    desc: "",
    icon: CheckCircle2,
    className: "",
  },
};

const PedidoConfirmado = () => {
  const { numero } = useParams<{ numero: string }>();
  const { state } = useLocation() as { state: { pedido?: Pedido } | null };
  const [searchParams] = useSearchParams();
  const pedido = state?.pedido;

  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");

  const [estadoPago, setEstadoPago] = useState<EstadoPago | null>(
    pedido?.metodoPago === "mercado_pago" ? pedido.estadoPago : null
  );
  const [verificando, setVerificando] = useState(Boolean(paymentId));

  useEffect(() => {
    if (!paymentId) return;

    api.pagos
      .verificar({ paymentId })
      .then((r) => setEstadoPago(r.estado_pago))
      .catch(() => {
        // Si no se puede verificar (p. ej. sin credenciales configuradas en local),
        // dejamos el estado tal como venga del pedido creado.
      })
      .finally(() => setVerificando(false));
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="container flex items-center justify-center h-14">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-full" />
            <span className="font-heading font-black text-sm text-foreground">Repuestos El Turco</span>
          </div>
        </div>
      </header>

      <main className="container py-12 max-w-2xl flex-1 flex flex-col items-center">
        {verificando ? (
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
              estadoPago === "rechazado" ? "bg-red-100" : "bg-emerald-100"
            }`}
          >
            {estadoPago === "rechazado" ? (
              <XCircle className="w-12 h-12 text-red-600" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            )}
          </div>
        )}

        <h1 className="font-heading font-black text-3xl text-foreground text-center mb-2">
          {verificando
            ? "Verificando tu pago..."
            : estadoPago === "rechazado"
              ? "No pudimos procesar tu pago"
              : "¡Pedido confirmado!"}
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          {estadoPago === "rechazado"
            ? "Tu pedido quedó registrado, pero el pago no se completó."
            : "Tu pedido fue registrado y está siendo preparado."}
        </p>

        <div
          className={`flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-4 ${
            estadoPago && estadoPago !== "no_aplica" && !verificando ? "mb-4" : "mb-8"
          }`}
        >
          <Package className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Número de pedido</p>
            <p className="font-mono font-black text-2xl text-primary">{numero}</p>
          </div>
        </div>

        {estadoPago && estadoPago !== "no_aplica" && !verificando && (
          <div
            className={`w-full flex items-start gap-3 border rounded-xl px-5 py-4 mb-8 ${ESTADO_PAGO_UI[estadoPago].className}`}
          >
            <CreditCard className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-bold text-sm">{ESTADO_PAGO_UI[estadoPago].label}</p>
              <p className="text-xs mt-0.5 opacity-90">{ESTADO_PAGO_UI[estadoPago].desc}</p>
            </div>
          </div>
        )}

        {pedido && (
          <div className="w-full bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-border">
              <p className="font-heading font-bold text-sm text-foreground">Resumen de tu pedido</p>
            </div>
            <ul className="divide-y divide-border">
              {pedido.items.map((item, i) => (
                <li key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.marca} · x{item.cantidad}
                    </p>
                  </div>
                  <p className="font-heading font-bold text-foreground">
                    {formatCLP(item.precio * item.cantidad)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 bg-muted/30 flex justify-between items-center">
              <span className="font-heading font-bold text-foreground">Total</span>
              <span className="font-heading font-black text-lg text-primary">
                {formatCLP(pedido.total)}
              </span>
            </div>
          </div>
        )}

        <div className="w-full bg-card border border-border rounded-xl p-5 mb-8 flex gap-3">
          <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-bold text-foreground text-sm">Retiro en tienda</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nos pondremos en contacto contigo para avisarte cuando el pedido esté listo.
              Lun–Vie 9:00–18:00 · Sáb 10:00–14:00
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold px-8 py-3.5 rounded-xl hover:brightness-110 transition-all"
        >
          Seguir comprando <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    </div>
  );
};

export default PedidoConfirmado;
