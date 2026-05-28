import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getConfig, saveConfig, useAdminStore } from "@/lib/adminStore";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@/types/admin";

const Configuracion = () => {
  const initial = useAdminStore(getConfig);
  const { toast } = useToast();
  const [form, setForm] = useState<SiteConfig>(initial);

  const set = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveConfig(form);
    toast({ title: "Configuración guardada", description: "Los datos del sitio se actualizaron." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Configuración del sitio</h2>
        <p className="text-sm text-muted-foreground">
          Información del negocio que se muestra en el sitio público (header, footer y contacto).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Nombre del negocio</label>
          <Input value={form.nombreNegocio} onChange={(e) => set("nombreNegocio", e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Teléfono principal</label>
            <Input value={form.telefono1} onChange={(e) => set("telefono1", e.target.value)} placeholder="+56 9 ..." />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono secundario</label>
            <Input value={form.telefono2} onChange={(e) => set("telefono2", e.target.value)} placeholder="+56 9 ..." />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">WhatsApp (con código país, sin signos)</label>
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="56977424442" />
          </div>
          <div>
            <label className="text-sm font-medium">Email de contacto</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Dirección</label>
          <Input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Ciudad / región</label>
            <Input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Horario de atención</label>
            <Input value={form.horario} onChange={(e) => set("horario", e.target.value)} />
          </div>
        </div>

        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" /> Guardar cambios
        </Button>
      </form>
    </div>
  );
};

export default Configuracion;
