import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { categorias } from "@/data/repuestos";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProductoAdmin } from "@/types/admin";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  producto: ProductoAdmin | null;
}

type FormData = Omit<ProductoAdmin, "id">;

const empty: FormData = {
  codigo: "",
  nombre: "",
  categoria: "Frenos",
  marca: "",
  precio: 0,
  descripcion: "",
  detalle: "",
  compatibilidad: [],
  imagen: "",
  stock: 0,
  activo: true,
};

const ProductoFormDialog = ({ open, onOpenChange, producto }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(empty);
  const [compatText, setCompatText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (producto) {
        const { id, ...rest } = producto;
        setForm(rest);
        setCompatText(producto.compatibilidad.map((c) => `${c.auto} | ${c.anios}`).join("\n"));
      } else {
        setForm(empty);
        setCompatText("");
      }
      setErrors({});
    }
  }, [open, producto]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.codigo.trim()) e.codigo = "El código es obligatorio.";
    if (!form.marca.trim()) e.marca = "La marca es obligatoria.";
    if (!form.precio || form.precio <= 0) e.precio = "El precio debe ser mayor a 0.";
    if (form.stock < 0) e.stock = "El stock no puede ser negativo.";
    if (form.imagen && !/^(https?:|data:|\/|blob:)/.test(form.imagen)) {
      e.imagen = "Debe ser una URL válida (https://...).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const parseCompat = () =>
    compatText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [auto, anios] = line.split("|").map((s) => s.trim());
        return { auto: auto || line, anios: anios || "" };
      });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data: FormData = {
        ...form,
        imagen: form.imagen || "/placeholder.svg",
        compatibilidad: parseCompat(),
      };
      if (producto) {
        await api.productos.update(producto.id, data);
        toast({ title: "Producto actualizado", description: data.nombre });
      } else {
        await api.productos.create(data);
        toast({ title: "Producto creado", description: data.nombre });
      }
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("409") || msg.toLowerCase().includes("código")) {
        setErrors((prev) => ({ ...prev, codigo: msg }));
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Actualiza los datos del producto." : "Registra un nuevo repuesto en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Código *</label>
              <Input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="AMG-009" />
              {errors.codigo && <p className="text-xs text-destructive mt-1">{errors.codigo}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Marca *</label>
              <Input value={form.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Bosch" />
              {errors.marca && <p className="text-xs text-destructive mt-1">{errors.marca}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Amortiguador trasero" />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre}</p>}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Categoría *</label>
              <select
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categorias.filter((c) => c !== "Todos").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Precio (CLP) *</label>
              <Input
                type="number"
                min={0}
                value={form.precio || ""}
                onChange={(e) => set("precio", parseInt(e.target.value || "0", 10))}
              />
              {errors.precio && <p className="text-xs text-destructive mt-1">{errors.precio}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", parseInt(e.target.value || "0", 10))}
              />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción corta</label>
            <Textarea
              rows={2}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Resumen visible en la tarjeta del producto."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Detalle completo</label>
            <Textarea
              rows={4}
              value={form.detalle}
              onChange={(e) => set("detalle", e.target.value)}
              placeholder="Descripción técnica completa, materiales, garantía, etc."
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL de imagen</label>
            <Input
              value={form.imagen}
              onChange={(e) => set("imagen", e.target.value)}
              placeholder="https://... (jpg/png) — opcional"
            />
            {errors.imagen && <p className="text-xs text-destructive mt-1">{errors.imagen}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">
              Compatibilidad (un vehículo por línea, formato: <code>Auto | Años</code>)
            </label>
            <Textarea
              rows={3}
              value={compatText}
              onChange={(e) => setCompatText(e.target.value)}
              placeholder={"Peugeot 206 | 1998-2012\nCitroën C3 | 2002-2016"}
              className="font-mono text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => set("activo", e.target.checked)}
              className="rounded border-input"
            />
            Producto activo (visible en el catálogo público)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductoFormDialog;
