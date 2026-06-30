import { useLocation, useParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Store, ArrowRight } from "lucide-react";
import logo from "../../public/img/logo-el-turco.png";
import type { Pedido } from "@/types/admin";

const formatCLP = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });

const PedidoConfirmado = () => {
  const { numero } = useParams<{ numero: string }>();
  const { state } = useLocation() as { state: { pedido?: Pedido } | null };
  const pedido = state?.pedido;

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
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>

        <h1 className="font-heading font-black text-3xl text-foreground text-center mb-2">
          ¡Pedido confirmado!
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Tu pedido fue registrado y está siendo preparado.
        </p>

        <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-4 mb-8">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Número de pedido</p>
            <p className="font-mono font-black text-2xl text-primary">{numero}</p>
          </div>
        </div>

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
