import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Phone, User, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EstadoPedido, Pedido } from "@/types/admin";
import { api } from "@/lib/api";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" });

const estados: EstadoPedido[] = ["pendiente", "preparando", "listo", "entregado", "cancelado"];

interface Props {
  pedido: Pedido | null;
  onClose: () => void;
}

const PedidoDetailDialog = ({ pedido, onClose }: Props) => {
  if (!pedido) return null;
  const wa = `https://wa.me/${pedido.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola ${pedido.cliente.nombre}, te contactamos desde Repuestos El Turco por tu pedido ${pedido.numero}.`,
  )}`;

  return (
    <Dialog open={!!pedido} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" /> Pedido {pedido.numero}
          </DialogTitle>
          <DialogDescription>Detalle completo del pedido y datos del cliente.</DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Cliente</p>
            <p className="flex items-center gap-2 font-bold text-foreground">
              <User className="w-4 h-4" /> {pedido.cliente.nombre}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" /> {pedido.cliente.telefono}
            </p>
            {pedido.cliente.email && (
              <p className="text-muted-foreground text-xs mt-1">{pedido.cliente.email}</p>
            )}
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Pedido</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" /> {formatDate(pedido.fecha)}
            </p>
            <div className="mt-2">
              <label className="text-xs text-muted-foreground">Estado</label>
              <select
                defaultValue={pedido.estado}
                onChange={(e) => api.pedidos.updateEstado(pedido.id, e.target.value as EstadoPedido)}
                className="block mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
              >
                {estados.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3 font-heading font-bold">Producto</th>
                <th className="text-center py-2 px-3 font-heading font-bold">Cant.</th>
                <th className="text-right py-2 px-3 font-heading font-bold">Precio</th>
                <th className="text-right py-2 px-3 font-heading font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pedido.items.map((it) => (
                <tr key={it.productoId}>
                  <td className="py-2 px-3">
                    <p className="font-bold text-foreground">{it.nombre}</p>
                    <p className="text-xs text-muted-foreground">{it.codigo} · {it.marca}</p>
                  </td>
                  <td className="py-2 px-3 text-center">{it.cantidad}</td>
                  <td className="py-2 px-3 text-right">{formatCLP(it.precio)}</td>
                  <td className="py-2 px-3 text-right font-bold">{formatCLP(it.precio * it.cantidad)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right font-heading font-bold uppercase text-xs tracking-wider">Total</td>
                <td className="py-3 px-3 text-right font-heading font-black text-lg text-primary">{formatCLP(pedido.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetailDialog;
