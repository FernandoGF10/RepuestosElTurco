import { useEffect, useState } from "react";
import { Download, TrendingUp, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/admin/components/StatCard";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

interface ReporteData {
  total_ventas: number;
  cant_pedidos: number;
  ticket_promedio: number;
  total_unidades: number;
  top_productos: { producto_id: string; codigo: string; nombre: string; cantidad: number; total: number }[];
}

const empty: ReporteData = {
  total_ventas: 0,
  cant_pedidos: 0,
  ticket_promedio: 0,
  total_unidades: 0,
  top_productos: [],
};

const Reportes = () => {
  const { toast } = useToast();

  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  const [desde, setDesde] = useState(toDateInput(monthAgo));
  const [hasta, setHasta] = useState(toDateInput(today));
  const [data, setData] = useState<ReporteData>(empty);

  useEffect(() => {
    api.reportes.get(desde, hasta).then(setData).catch(() => setData(empty));
  }, [desde, hasta]);

  const exportCSV = async () => {
    try {
      const reporte = await api.reportes.get(desde, hasta);
      const rows = [
        ["Codigo", "Nombre", "Unidades", "Total"],
        ...reporte.top_productos.map((p) => [p.codigo, p.nombre, p.cantidad.toString(), p.total.toString()]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-ventas_${desde}_${hasta}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Reporte exportado", description: `Top productos en CSV.` });
    } catch {
      toast({ title: "Error al exportar", variant: "destructive" });
    }
  };

  const top = data.top_productos;

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
        <StatCard label="Ventas totales" value={formatCLP(data.total_ventas)} icon={TrendingUp} tone="success" />
        <StatCard label="Pedidos" value={data.cant_pedidos} icon={ShoppingBag} tone="primary" />
        <StatCard label="Ticket promedio" value={formatCLP(data.ticket_promedio)} icon={TrendingUp} tone="secondary" />
        <StatCard label="Unidades vendidas" value={data.total_unidades} icon={Package} tone="warning" />
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-heading font-bold text-foreground mb-4">Top productos vendidos</h3>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sin ventas en el período seleccionado.</p>
        ) : (
          <ul className="space-y-2">
            {top.map((p, i) => {
              const max = top[0].cantidad;
              const pct = (p.cantidad / max) * 100;
              return (
                <li key={p.codigo} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      <span className="text-muted-foreground font-mono mr-2">#{i + 1}</span>
                      {p.nombre}
                    </span>
                    <span className="font-heading font-bold">
                      {p.cantidad} u. · {formatCLP(p.total)}
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
