import { FormEvent, useEffect, useState } from "react";
import { Save, Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@/types/admin";

const DEFAULT_CONFIG: SiteConfig = {
  nombreNegocio: "Repuestos El Turco",
  direccion: "Av. Principal 1234, Local 5",
  telefono1: "+56 9 7742 4442",
  telefono2: "+56 9 6629 3400",
  whatsapp: "56977424442",
  email: "contacto@repuestoselturco.cl",
  horario: "Lun-Vie 9:00-18:00 | Sáb 10:00-14:00",
  ciudad: "Santiago, Chile",
};

interface Marca {
  id: number;
  nombre: string;
  logo: string | null;
  activa: boolean;
}

const Configuracion = () => {
  const { toast } = useToast();

  const [form, setForm] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [nuevoLogo, setNuevoLogo] = useState("");

  useEffect(() => {
    api.config.get().then(setForm).catch(() => {});
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    try {
      const data = await api.marcas.list();
      setMarcas(data as Marca[]);
    } catch (error) {
      console.error(error);
    }
  };

  const set = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.config.update(form);
      setForm(updated);
      toast({ title: "Configuración guardada", description: "Los datos del sitio se actualizaron." });
    } catch (err) {
      toast({ title: "Error al guardar", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const agregarMarca = async () => {
    if (!nuevaMarca.trim()) return;
    try {
      const marca = await api.marcas.create({ nombre: nuevaMarca, logo: nuevoLogo || null });
      setMarcas((prev) => [...prev, marca as Marca]);
      setNuevaMarca("");
      setNuevoLogo("");
      toast({ title: "Marca agregada", description: `${marca.nombre} fue agregada correctamente` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar la marca", variant: "destructive" });
    }
  };

  const eliminarMarca = async (id: number) => {
    try {
      await api.marcas.delete(id);
      setMarcas((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Marca eliminada" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la marca", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Configuración</h2>
        <p className="text-sm text-muted-foreground">Información del negocio y marcas que se muestran en el sitio.</p>
      </div>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── Config form (2 cols) ── */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-heading font-black text-base text-foreground">Datos del negocio</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Se muestran en header, footer y página de contacto.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Nombre del negocio</label>
              <Input value={form.nombreNegocio} onChange={(e) => set("nombreNegocio", e.target.value)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Teléfono principal</label>
                <Input value={form.telefono1} onChange={(e) => set("telefono1", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Teléfono secundario</label>
                <Input value={form.telefono2} onChange={(e) => set("telefono2", e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">WhatsApp</label>
                <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Email de contacto</label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Dirección</label>
              <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Ciudad / región</label>
                <Input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-heading font-bold text-foreground mb-1.5 block">Horario de atención</label>
                <Input value={form.horario} onChange={(e) => set("horario", e.target.value)} />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="gap-2 font-heading font-bold" disabled={loading}>
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Marcas panel (1 col) ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-heading font-black text-base text-foreground">Marcas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Marcas de vehículos del catálogo.</p>
          </div>

          {/* Agregar nueva */}
          <div className="px-6 py-4 border-b border-border space-y-3">
            <Input
              placeholder="Nombre de la marca"
              value={nuevaMarca}
              onChange={(e) => setNuevaMarca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarMarca())}
            />
            <Input
              placeholder="Ruta del logo (ej: /logos/peugeot.png)"
              value={nuevoLogo}
              onChange={(e) => setNuevoLogo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarMarca())}
            />
            <Button
              type="button"
              onClick={agregarMarca}
              className="w-full gap-2 font-heading font-bold"
              disabled={!nuevaMarca.trim()}
            >
              <Plus className="w-4 h-4" />
              Agregar marca
            </Button>
          </div>

          {/* Lista de marcas */}
          <div className="divide-y divide-border">
            {marcas.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Tag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay marcas registradas.</p>
              </div>
            ) : (
              marcas.map((marca) => (
                <div key={marca.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  {marca.logo ? (
                    <img
                      src={marca.logo}
                      alt={marca.nombre}
                      className="w-9 h-9 object-contain rounded-lg bg-muted p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm text-foreground truncate">{marca.nombre}</p>
                    {marca.logo && (
                      <p className="text-xs text-muted-foreground truncate">{marca.logo}</p>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarMarca(marca.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label={`Eliminar ${marca.nombre}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Configuracion;
