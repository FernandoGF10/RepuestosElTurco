import { useEffect, useMemo, useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

interface ClienteResumen {
  nombre: string;
  telefono: string;
  email: string;
  total_pedidos: number;
  total_gastado: number;
  ultimo_pedido: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [search, setSearch]     = useState("");

  useEffect(() => { api.clientes.list().then(setClientes); }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return clientes.filter(
      (c) => !t || c.nombre.toLowerCase().includes(t) || c.telefono.includes(t) || c.email.toLowerCase().includes(t),
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Clientes</h2>
        <p className="text-sm text-muted-foreground">Listado de clientes generado a partir de los pedidos registrados.</p>
      </div>

      {/* Búsqueda */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Cliente</th>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4 hidden md:table-cell">Contacto</th>
                <th className="text-center font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Pedidos</th>
                <th className="text-right font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Total gastado</th>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4 hidden sm:table-cell">Última compra</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-muted-foreground font-heading font-bold">
                    {clientes.length === 0 ? "Aún no hay clientes registrados." : "Ningún cliente coincide."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const wa = `https://wa.me/${c.telefono.replace(/\D/g, "")}`;
                  return (
                    <tr key={c.telefono} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary text-white font-heading font-bold text-xs flex items-center justify-center shrink-0">
                            {c.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <p className="font-heading font-bold text-foreground">{c.nombre}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-foreground text-sm">{c.telefono}</p>
                        {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                      </td>
                      <td className="py-3 px-4 text-center font-heading font-bold">{c.total_pedidos}</td>
                      <td className="py-3 px-4 text-right font-heading font-bold text-primary">{formatCLP(c.total_gastado)}</td>
                      <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground text-sm">{formatDate(c.ultimo_pedido)}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
