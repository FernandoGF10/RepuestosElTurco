import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ProductoFormDialog from "@/admin/components/ProductoFormDialog";
import type { ProductoAdmin } from "@/types/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

const Productos = () => {
  const { toast } = useToast();
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [editing, setEditing] = useState<ProductoAdmin | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductoAdmin | null>(null);

  const cargar = () => {
    api.productos.list({ solo_activos: false }).then(setProductos);
  };

  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return productos.filter((p) => {
      const matchSearch =
        !t ||
        p.nombre.toLowerCase().includes(t) ||
        p.codigo.toLowerCase().includes(t) ||
        p.marca.toLowerCase().includes(t);
      const matchEstado =
        estado === "todos" || (estado === "activo" ? p.activo : !p.activo);
      return matchSearch && matchEstado;
    });
  }, [productos, search, estado]);

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (p: ProductoAdmin) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleToggle = async (p: ProductoAdmin) => {
    try {
      const updated = await api.productos.toggle(p.id);
      setProductos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleStockBlur = async (p: ProductoAdmin, stock: number) => {
    const safe = Math.max(0, Math.floor(stock || 0));
    if (safe === p.stock) return;
    try {
      const updated = await api.productos.updateStock(p.id, safe);
      setProductos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      toast({ title: "Error al actualizar stock", description: String(err), variant: "destructive" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.productos.delete(confirmDelete.id);
      setProductos((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      toast({ title: "Producto eliminado", description: confirmDelete.nombre });
    } catch (err) {
      toast({
        title: "No se puede eliminar",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-2xl text-foreground">Gestión de productos</h2>
          <p className="text-sm text-muted-foreground">Crea, edita, controla stock y disponibilidad de tu catálogo.</p>
        </div>
        <Button onClick={handleNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo producto
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["todos", "activo", "inactivo"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-3 py-2 text-xs font-heading font-bold rounded-md uppercase tracking-wider transition-colors ${
                estado === e
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-heading font-bold py-3 px-4">Producto</th>
                <th className="text-left font-heading font-bold py-3 px-4 hidden md:table-cell">Código</th>
                <th className="text-left font-heading font-bold py-3 px-4 hidden lg:table-cell">Marca</th>
                <th className="text-right font-heading font-bold py-3 px-4">Precio</th>
                <th className="text-center font-heading font-bold py-3 px-4">Stock</th>
                <th className="text-center font-heading font-bold py-3 px-4">Estado</th>
                <th className="text-right font-heading font-bold py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No hay productos que coincidan.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <ProductoRow
                    key={p.id}
                    producto={p}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={setConfirmDelete}
                    onStockBlur={handleStockBlur}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductoFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) cargar();
        }}
        producto={editing}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{confirmDelete?.nombre}</strong>. Esta acción no se puede deshacer.
              Si el producto está asociado a pedidos, no podrá eliminarse y deberás desactivarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface RowProps {
  producto: ProductoAdmin;
  onEdit: (p: ProductoAdmin) => void;
  onToggle: (p: ProductoAdmin) => void;
  onDelete: (p: ProductoAdmin) => void;
  onStockBlur: (p: ProductoAdmin, stock: number) => void;
}

const ProductoRow = ({ producto: p, onEdit, onToggle, onDelete, onStockBlur }: RowProps) => {
  const [localStock, setLocalStock] = useState(p.stock);

  useEffect(() => { setLocalStock(p.stock); }, [p.stock]);

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={p.imagen} alt="" className="w-10 h-10 rounded object-contain bg-muted shrink-0" />
          <div className="min-w-0">
            <p className="font-heading font-bold text-foreground truncate">{p.nombre}</p>
            <p className="text-xs text-muted-foreground">{p.categoria}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 font-mono text-xs hidden md:table-cell">{p.codigo}</td>
      <td className="py-3 px-4 hidden lg:table-cell">{p.marca}</td>
      <td className="py-3 px-4 text-right font-heading font-bold">{formatCLP(p.precio)}</td>
      <td className="py-3 px-4">
        <input
          type="number"
          min={0}
          value={localStock}
          onChange={(e) => setLocalStock(parseInt(e.target.value || "0", 10))}
          onBlur={() => onStockBlur(p, localStock)}
          className={`w-16 mx-auto block text-center font-bold rounded-md border px-2 py-1 text-sm ${
            localStock === 0
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : localStock <= 3
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-border bg-background text-foreground"
          }`}
        />
      </td>
      <td className="py-3 px-4 text-center">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
            p.activo ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.activo ? "bg-emerald-500" : "bg-muted-foreground"}`} />
          {p.activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggle(p)}
            title={p.activo ? "Desactivar" : "Activar"}
            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(p)}
            title="Editar"
            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(p)}
            title="Eliminar"
            className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Productos;
