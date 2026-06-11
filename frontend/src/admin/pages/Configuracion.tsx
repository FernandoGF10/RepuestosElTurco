import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
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
  logo: string;
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
      setMarcas(data);
    } catch (error) {
      console.error(error);
    }
  };

  const set = <K extends keyof SiteConfig>(
    k: K,
    v: SiteConfig[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await api.config.update(form);

      setForm(updated);

      toast({
        title: "Configuración guardada",
        description: "Los datos del sitio se actualizaron.",
      });
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarMarca = async () => {
    if (!nuevaMarca.trim()) return;

    try {
      const marca = await api.marcas.create({
        nombre: nuevaMarca,
        logo: nuevoLogo,
      });

      setMarcas((prev) => [...prev, marca]);

      setNuevaMarca("");
      setNuevoLogo("");

      toast({
        title: "Marca agregada",
        description: `${marca.nombre} fue agregada correctamente`,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "No se pudo agregar la marca",
        variant: "destructive",
      });
    }
  };

  const eliminarMarca = async (id: number) => {
    try {
      await api.marcas.delete(id);

      setMarcas((prev) =>
        prev.filter((m) => m.id !== id)
      );

      toast({
        title: "Marca eliminada",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "No se pudo eliminar la marca",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">
          Configuración del sitio
        </h2>

        <p className="text-sm text-muted-foreground">
          Información del negocio que se muestra en el sitio público
          (header, footer y contacto).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-6 space-y-5"
      >
        <div>
          <label className="text-sm font-medium">
            Nombre del negocio
          </label>

          <Input
            value={form.nombreNegocio}
            onChange={(e) =>
              set("nombreNegocio", e.target.value)
            }
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              Teléfono principal
            </label>

            <Input
              value={form.telefono1}
              onChange={(e) =>
                set("telefono1", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Teléfono secundario
            </label>

            <Input
              value={form.telefono2}
              onChange={(e) =>
                set("telefono2", e.target.value)
              }
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              WhatsApp
            </label>

            <Input
              value={form.whatsapp}
              onChange={(e) =>
                set("whatsapp", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email de contacto
            </label>

            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                set("email", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Dirección
          </label>

          <Input
            value={form.direccion}
            onChange={(e) =>
              set("direccion", e.target.value)
            }
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              Ciudad / región
            </label>

            <Input
              value={form.ciudad}
              onChange={(e) =>
                set("ciudad", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Horario de atención
            </label>

            <Input
              value={form.horario}
              onChange={(e) =>
                set("horario", e.target.value)
              }
            />
          </div>
        </div>

        <Button
          type="submit"
          className="gap-2"
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>

        <hr />

        <div className="space-y-4">
          <h3 className="font-bold text-lg">
            Marcas del negocio
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre marca"
              value={nuevaMarca}
              onChange={(e) =>
                setNuevaMarca(e.target.value)
              }
            />

            <Input
              placeholder="URL del logo"
              value={nuevoLogo}
              onChange={(e) =>
                setNuevoLogo(e.target.value)
              }
            />
          </div>

          <Button
            type="button"
            onClick={agregarMarca}
          >
            Agregar Marca
          </Button>

          <div className="space-y-2">
            {marcas.map((marca) => (
              <div
                key={marca.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">
                    {marca.nombre}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {marca.logo}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    eliminarMarca(marca.id)
                  }
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Configuracion;