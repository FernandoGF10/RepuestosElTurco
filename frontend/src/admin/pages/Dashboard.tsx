import { Link } from "react-router-dom";
import { Package, ShoppingBag, DollarSign, AlertTriangle, ArrowRight, Users } from "lucide-react";
import StatCard from "@/admin/components/StatCard";
import { getPedidos, getProductos, useAdminStore } from "@/lib/adminStore";

const formatCLP = (n: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const Dashboard = () => {
  const productos = useAdminStore(getProductos);
  const pedidos = useAdminStore(getPedidos);

  const totalVentas = pedidos.filter((p) => p.estado !== "cancelado").reduce((s, p) => s + p.total, 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "preparando").length;
  const stockBajo = productos.filter((p) => p.activo && p.stock > 0 && p.stock <= 3).length;
  const sinStock = productos.filter((p) => p.activo && p.stock === 0).length;
  const clientesUnicos = new Set(pedidos.map((p) => p.cliente.telefono)).size;

  const ultimosPedidos = [...pedidos]
    .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
    .slice(0, 5);

  const productosBajoStock = productos
    .filter((p) => p.activo && p.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Resumen general</h2>
        <p className="text-sm text-muted-foreground">Métricas clave del negocio en tiempo real.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pedidos totales" value={pedidos.length} hint={`${pedidosPendientes} por gestionar`} icon={ShoppingBag} tone="primary" />
        <StatCard label="Ventas acumuladas" value={formatCLP(totalVentas)} hint="Pedidos no cancelados" icon={DollarSign} tone="success" />
        <StatCard label="Productos activos" value={productos.filter((p) => p.activo).length} hint={`${productos.length} en catálogo`} icon={Package} tone="secondary" />
        <StatCard label="Clientes únicos" value={clientesUnicos} hint="Por contacto" icon={Users} tone="primary" />
      </div>

      {(stockBajo > 0 || sinStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-900">Atención al inventario</p>
            <p className="text-amber-800">
              {sinStock > 0 && <>{sinStock} producto(s) sin stock. </>}
              {stockBajo > 0 && <>{stockBajo} producto(s) con stock bajo (≤ 3 unidades).</>}{" "}
              <Link to="/admin/productos" className="underline font-bold">Revisar inventario</Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-foreground">Últimos pedidos</h3>
            <Link to="/admin/pedidos" className="text-xs font-heading font-bold text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {ultimosPedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {ultimosPedidos.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-sm text-foreground">{p.numero}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.cliente.nombre}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading font-bold text-sm text-foreground">{formatCLP(p.total)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.estado}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-foreground">Stock bajo</h3>
            <Link to="/admin/productos" className="text-xs font-heading font-bold text-primary hover:underline flex items-center gap-1">
              Gestionar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {productosBajoStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Todo el stock en buenos niveles.</p>
          ) : (
            <ul className="divide-y divide-border">
              {productosBajoStock.map((p) => (
                <li key={p.id} className="py-3 flex items-center gap-3">
                  <img src={p.imagen} alt="" className="w-10 h-10 rounded object-contain bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-sm text-foreground truncate">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">{p.codigo} · {p.marca}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {p.stock} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
