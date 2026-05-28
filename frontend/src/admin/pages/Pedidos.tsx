import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPedidos, updatePedidoEstado, useAdminStore } from "@/lib/adminStore";
import type { EstadoPedido, Pedido } from "@/types/admin";
import PedidoDetailDialog from "@/admin/components/PedidoDetailDialog";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

const estadoStyles: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  preparando: "bg-blue-100 text-blue-700",
  listo: "bg-violet-100 text-violet-700",
  entregado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-red-100 text-red-700",
};

const estados: EstadoPedido[] = ["pendiente", "preparando", "listo", "entregado", "cancelado"];

const Pedidos = () => {
  const pedidos = useAdminStore(getPedidos);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoPedido>("todos");
  const [selected, setSelected] = useState<Pedido | null>(null);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return [...pedidos]
      .filter((p) => {
        const matchSearch =
          !t ||
          p.numero.toLowerCase().includes(t) ||
          p.cliente.nombre.toLowerCase().includes(t) ||
          p.cliente.telefono.toLowerCase().includes(t);
        const matchEstado = filterEstado === "todos" || p.estado === filterEstado;
        return matchSearch && matchEstado;
      })
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [pedidos, search, filterEstado]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">Gestiona los pedidos realizados por los clientes.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium"
        >
          <option value="todos">Todos los estados</option>
          {estados.map((e) => (
            <option key={e} value={e} className="capitalize">{e}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-heading font-bold py-3 px-4">N° pedido</th>
                <th className="text-left font-heading font-bold py-3 px-4">Cliente</th>
                <th className="text-left font-heading font-bold py-3 px-4 hidden md:table-cell">Fecha</th>
                <th className="text-center font-heading font-bold py-3 px-4 hidden sm:table-cell">Items</th>
                <th className="text-right font-heading font-bold py-3 px-4">Total</th>
                <th className="text-center font-heading font-bold py-3 px-4">Estado</th>
                <th className="text-right font-heading font-bold py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No hay pedidos que coincidan.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{p.numero}</td>
                    <td className="py-3 px-4">
                      <p className="font-heading font-bold text-foreground">{p.cliente.nombre}</p>
                      <p className="text-xs text-muted-foreground">{p.cliente.telefono}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{formatDate(p.fecha)}</td>
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      {p.items.reduce((s, i) => s + i.cantidad, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-heading font-bold">{formatCLP(p.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={p.estado}
                        onChange={(e) => updatePedidoEstado(p.id, e.target.value as EstadoPedido)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border-0 cursor-pointer ${estadoStyles[p.estado]}`}
                      >
                        {estados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelected(p)}
                        className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PedidoDetailDialog pedido={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Pedidos;
