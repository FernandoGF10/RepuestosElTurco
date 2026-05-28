import { useMemo, useState } from "react";
import { Download, TrendingUp, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/admin/components/StatCard";
import { getPedidos, useAdminStore } from "@/lib/adminStore";
import { useToast } from "@/hooks/use-toast";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

const Reportes = () => {
  const pedidos = useAdminStore(getPedidos);
  const { toast } = useToast();

  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  const [desde, setDesde] = useState(toDateInput(monthAgo));
  const [hasta, setHasta] = useState(toDateInput(today));

  const filtrados = useMemo(() => {
    const d = new Date(desde + "T00:00:00");
    const h = new Date(hasta + "T23:59:59");
    return pedidos.filter((p) => {
      const f = new Date(p.fecha);
      return f >= d && f <= h && p.estado !== "cancelado";
    });
  }, [pedidos, desde, hasta]);

  const totalVentas = filtrados.reduce((s, p) => s + p.total, 0);
  const cantPedidos = filtrados.length;
  const ticketProm = cantPedidos ? totalVentas / cantPedidos : 0;
  const totalUnidades = filtrados.reduce(
    (s, p) => s + p.items.reduce((ss, i) => ss + i.cantidad, 0),
    0,
  );

  const topProductos = useMemo(() => {
    const map = new Map<string, { nombre: string; codigo: string; cant: number; total: number }>();
    for (const p of filtrados) {
      for (const it of p.items) {
        const ex = map.get(it.productoId);
        if (ex) {
          ex.cant += it.cantidad;
          ex.total += it.precio * it.cantidad;
        } else {
          map.set(it.productoId, {
            nombre: it.nombre,
            codigo: it.codigo,
            cant: it.cantidad,
            total: it.precio * it.cantidad,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.cant - a.cant).slice(0, 10);
  }, [filtrados]);

  const exportCSV = () => {
    const rows = [
      ["Numero", "Fecha", "Cliente", "Telefono", "Items", "Total", "Estado"],
      ...filtrados.map((p) => [
        p.numero,
        new Date(p.fecha).toISOString(),
        p.cliente.nombre,
        p.cliente.telefono,
        p.items.reduce((s, i) => s + i.cantidad, 0).toString(),
        p.total.toString(),
        p.estado,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-ventas_${desde}_${hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Reporte exportado", description: `${filtrados.length} pedidos en CSV.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-2xl text-foreground">Reportes de ventas</h2>
          <p className="text-sm text-muted-foreground">Analiza el desempeño del negocio en un período.</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="block mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="block mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground ml-auto">Excluye pedidos cancelados.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ventas totales" value={formatCLP(totalVentas)} icon={TrendingUp} tone="success" />
        <StatCard label="Pedidos" value={cantPedidos} icon={ShoppingBag} tone="primary" />
        <StatCard label="Ticket promedio" value={formatCLP(Math.round(ticketProm))} icon={TrendingUp} tone="secondary" />
        <StatCard label="Unidades vendidas" value={totalUnidades} icon={Package} tone="warning" />
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-heading font-bold text-foreground mb-4">Top productos vendidos</h3>
        {topProductos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sin ventas en el período seleccionado.</p>
        ) : (
          <ul className="space-y-2">
            {topProductos.map((p, i) => {
              const max = topProductos[0].cant;
              const pct = (p.cant / max) * 100;
              return (
                <li key={p.codigo} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      <span className="text-muted-foreground font-mono mr-2">#{i + 1}</span>
                      {p.nombre}
                    </span>
                    <span className="font-heading font-bold">
                      {p.cant} u. · {formatCLP(p.total)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reportes;
