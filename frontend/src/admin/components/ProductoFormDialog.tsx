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
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProductoAdmin, ProductoCompatibilidadAuto } from "@/types/admin";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  producto: ProductoAdmin | null;
}

type FormData = Omit<ProductoAdmin, "id">;

const empty: FormData = {
  codigo: "",
  nombre: "",
  familia_id: undefined,
  subfamilia_id: undefined,
  marca: "",
  precio: 0,
  descripcion: "",
  detalle: "",
  compatibilidad: [],
  compatibilidades_auto: [],
  imagen: "",
  stock: 0,
  activo: true,
};

interface Familia {
  id: number;
  nombre: string;
  imagen: string;
}

interface Subfamilia {
  id: number;
  nombre: string;
  familia_id: number;
}

interface MarcaVehiculo {
  id: number;
  nombre: string;
  logo?: string;
  activa?: boolean;
}

interface ModeloAuto {
  id: number;
  marca_id: number;
  nombre: string;
  activo: boolean;
  marca_nombre?: string;
}

interface MotorAuto {
  id: number;
  modelo_id: number;
  nombre: string;
  activo: boolean;
  modelo_nombre?: string;
}

interface CompatDraft {
  marca_id: string;
  modelo_id: string;
  motor_id: string;
  anio_desde: string;
  anio_hasta: string;
}

const emptyCompatDraft: CompatDraft = {
  marca_id: "",
  modelo_id: "",
  motor_id: "",
  anio_desde: "",
  anio_hasta: "",
};

const ProductoFormDialog = ({ open, onOpenChange, producto }: Props) => {
  const { toast } = useToast();

  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);

  const [familiaSeleccionada, setFamiliaSeleccionada] = useState<number | null>(null);
  const [subfamiliaSeleccionada, setSubfamiliaSeleccionada] = useState<number | null>(null);

  const [marcasVehiculo, setMarcasVehiculo] = useState<MarcaVehiculo[]>([]);
  const [modelosVehiculo, setModelosVehiculo] = useState<ModeloAuto[]>([]);
  const [motoresVehiculo, setMotoresVehiculo] = useState<MotorAuto[]>([]);

  const [compatDraft, setCompatDraft] = useState<CompatDraft>(emptyCompatDraft);
  const [compatibilidadesAuto, setCompatibilidadesAuto] = useState<ProductoCompatibilidadAuto[]>([]);

  useEffect(() => {
    if (!open) return;

    const cargar = async () => {
      try {
        const [familiasData, subfamiliasData, marcasVehiculoData] = await Promise.all([
          api.familias.list(),
          api.subfamilias.list(),
          api.vehiculos.marcas(),
        ]);

        setFamilias(familiasData as Familia[]);
        setSubfamilias(subfamiliasData as Subfamilia[]);
        setMarcasVehiculo(marcasVehiculoData as MarcaVehiculo[]);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "No se pudieron cargar las opciones del formulario.",
          variant: "destructive",
        });
      }
    };

    cargar();
  }, [open, toast]);

  useEffect(() => {
    if (!open) return;

    if (producto) {
      const { id, ...rest } = producto;
      setForm({
        ...rest,
        compatibilidades_auto: producto.compatibilidades_auto ?? [],
      });

      setFamiliaSeleccionada(producto.familia_id ?? null);
      setSubfamiliaSeleccionada(producto.subfamilia_id ?? null);
      setCompatibilidadesAuto(producto.compatibilidades_auto ?? []);
    } else {
      setForm(empty);
      setFamiliaSeleccionada(null);
      setSubfamiliaSeleccionada(null);
      setCompatibilidadesAuto([]);
    }

    setCompatDraft(emptyCompatDraft);
    setErrors({});
  }, [open, producto]);

  useEffect(() => {
    if (!open || !compatDraft.marca_id) {
      setModelosVehiculo([]);
      return;
    }

    const cargarModelos = async () => {
      try {
        const data = await api.vehiculos.modelos(Number(compatDraft.marca_id));
        setModelosVehiculo(data as ModeloAuto[]);
      } catch (err) {
        console.error(err);
      }
    };

    cargarModelos();
  }, [open, compatDraft.marca_id]);

  useEffect(() => {
    if (!open || !compatDraft.modelo_id) {
      setMotoresVehiculo([]);
      return;
    }

    const cargarMotores = async () => {
      try {
        const data = await api.vehiculos.motores(Number(compatDraft.modelo_id));
        setMotoresVehiculo(data as MotorAuto[]);
      } catch (err) {
        console.error(err);
      }
    };

    cargarMotores();
  }, [open, compatDraft.modelo_id]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.codigo.trim()) e.codigo = "El código es obligatorio.";
    if (!form.marca.trim()) e.marca = "La marca del repuesto es obligatoria.";
    if (!form.precio || form.precio <= 0) e.precio = "El precio debe ser mayor a 0.";
    if (form.stock < 0) e.stock = "El stock no puede ser negativo.";

    if (form.imagen && !/^(https?:|data:|\/|blob:)/.test(form.imagen)) {
      e.imagen = "Debe ser una URL válida (https://...).";
    }

    if (!familiaSeleccionada) e.familia_id = "Debe seleccionar una familia.";
    if (!subfamiliaSeleccionada) e.subfamilia_id = "Debe seleccionar una subfamilia.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const nombreMarcaVehiculo = (id: number) => {
    return marcasVehiculo.find((m) => m.id === id)?.nombre ?? "";
  };

  const nombreModeloVehiculo = (id: number, fallback?: string) => {
    return fallback || modelosVehiculo.find((m) => m.id === id)?.nombre || "";
  };

  const nombreMotorVehiculo = (id: number, fallback?: string) => {
    return fallback || motoresVehiculo.find((m) => m.id === id)?.nombre || "";
  };

  const agregarCompatibilidad = () => {
    const marcaId = Number(compatDraft.marca_id);
    const modeloId = Number(compatDraft.modelo_id);
    const motorId = Number(compatDraft.motor_id);
    const anioDesde = Number(compatDraft.anio_desde);
    const anioHasta = Number(compatDraft.anio_hasta);

    if (!marcaId || !modeloId || !motorId || !anioDesde || !anioHasta) {
      setErrors((prev) => ({
        ...prev,
        compatibilidad: "Completa marca, modelo, motor y años.",
      }));
      return;
    }

    if (anioDesde < 1900 || anioHasta > 2100) {
      setErrors((prev) => ({
        ...prev,
        compatibilidad: "Los años deben estar entre 1900 y 2100.",
      }));
      return;
    }

    if (anioHasta < anioDesde) {
      setErrors((prev) => ({
        ...prev,
        compatibilidad: "El año hasta no puede ser menor que el año desde.",
      }));
      return;
    }

    const existe = compatibilidadesAuto.some(
      (c) =>
        c.marca_id === marcaId &&
        c.modelo_id === modeloId &&
        c.motor_id === motorId &&
        c.anio_desde === anioDesde &&
        c.anio_hasta === anioHasta
    );

    if (existe) {
      setErrors((prev) => ({
        ...prev,
        compatibilidad: "Esa compatibilidad ya fue agregada.",
      }));
      return;
    }

    const marca = marcasVehiculo.find((m) => m.id === marcaId);
    const modelo = modelosVehiculo.find((m) => m.id === modeloId);
    const motor = motoresVehiculo.find((m) => m.id === motorId);

    setCompatibilidadesAuto((prev) => [
      ...prev,
      {
        marca_id: marcaId,
        modelo_id: modeloId,
        motor_id: motorId,
        anio_desde: anioDesde,
        anio_hasta: anioHasta,
        marca_nombre: marca?.nombre,
        modelo_nombre: modelo?.nombre,
        motor_nombre: motor?.nombre,
      },
    ]);

    setCompatDraft(emptyCompatDraft);

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.compatibilidad;
      return copy;
    });
  };

  const eliminarCompatibilidad = (index: number) => {
    setCompatibilidadesAuto((prev) => prev.filter((_, i) => i !== index));
  };

  const compatibilidadTexto = compatibilidadesAuto.map((c) => ({
    auto: `${c.marca_nombre ?? nombreMarcaVehiculo(c.marca_id)} ${
      c.modelo_nombre ?? nombreModeloVehiculo(c.modelo_id, c.modelo_nombre)
    } ${c.motor_nombre ?? nombreMotorVehiculo(c.motor_id, c.motor_nombre)}`.trim(),
    anios: `${c.anio_desde}-${c.anio_hasta}`,
  }));

  const compatibilidadesPayload = compatibilidadesAuto.map((c) => ({
    marca_id: c.marca_id,
    modelo_id: c.modelo_id,
    motor_id: c.motor_id,
    anio_desde: c.anio_desde,
    anio_hasta: c.anio_hasta,
  }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const data: FormData = {
        ...form,
        familia_id: familiaSeleccionada ?? undefined,
        subfamilia_id: subfamiliaSeleccionada ?? undefined,
        imagen: form.imagen || "/placeholder.svg",
        compatibilidad: compatibilidadTexto.length > 0 ? compatibilidadTexto : form.compatibilidad,
        compatibilidades_auto: compatibilidadesPayload,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {producto
              ? "Actualiza los datos del producto."
              : "Registra un nuevo repuesto en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Código *</label>
              <Input
                value={form.codigo}
                onChange={(e) => set("codigo", e.target.value)}
                placeholder="AMG-009"
              />
              {errors.codigo && (
                <p className="text-xs text-destructive mt-1">{errors.codigo}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Marca del repuesto *</label>
              <Input
                value={form.marca}
                onChange={(e) => set("marca", e.target.value)}
                placeholder="Bosch, Monroe, Valeo..."
              />
              {errors.marca && (
                <p className="text-xs text-destructive mt-1">{errors.marca}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <Input
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Amortiguador trasero"
            />
            {errors.nombre && (
              <p className="text-xs text-destructive mt-1">{errors.nombre}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Familia *</label>
              <select
                value={familiaSeleccionada ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setFamiliaSeleccionada(id || null);
                  setSubfamiliaSeleccionada(null);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccione una familia</option>
                {familias.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
              {errors.familia_id && (
                <p className="text-xs text-destructive mt-1">{errors.familia_id}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Subfamilia *</label>
              <select
                value={subfamiliaSeleccionada ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSubfamiliaSeleccionada(id || null);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccione una subfamilia</option>
                {subfamilias
                  .filter((s) => s.familia_id === familiaSeleccionada)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
              </select>
              {errors.subfamilia_id && (
                <p className="text-xs text-destructive mt-1">{errors.subfamilia_id}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Precio (CLP) *</label>
              <Input
                type="number"
                min={0}
                value={form.precio || ""}
                onChange={(e) => set("precio", parseInt(e.target.value || "0", 10))}
              />
              {errors.precio && (
                <p className="text-xs text-destructive mt-1">{errors.precio}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Stock</label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", parseInt(e.target.value || "0", 10))}
              />
              {errors.stock && (
                <p className="text-xs text-destructive mt-1">{errors.stock}</p>
              )}
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
            {errors.imagen && (
              <p className="text-xs text-destructive mt-1">{errors.imagen}</p>
            )}
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Compatibilidad del vehículo</h3>
              <p className="text-xs text-muted-foreground">
                Selecciona marca, modelo, motor y rango de años. Puedes agregar más de una
                compatibilidad.
              </p>
            </div>

            <div className="grid sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium">Marca vehículo</label>
                <select
                  value={compatDraft.marca_id}
                  onChange={(e) =>
                    setCompatDraft({
                      marca_id: e.target.value,
                      modelo_id: "",
                      motor_id: "",
                      anio_desde: compatDraft.anio_desde,
                      anio_hasta: compatDraft.anio_hasta,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Marca</option>
                  {marcasVehiculo.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium">Modelo</label>
                <select
                  value={compatDraft.modelo_id}
                  disabled={!compatDraft.marca_id}
                  onChange={(e) =>
                    setCompatDraft({
                      ...compatDraft,
                      modelo_id: e.target.value,
                      motor_id: "",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="">Modelo</option>
                  {modelosVehiculo.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium">Motor</label>
                <select
                  value={compatDraft.motor_id}
                  disabled={!compatDraft.modelo_id}
                  onChange={(e) =>
                    setCompatDraft({
                      ...compatDraft,
                      motor_id: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="">Motor</option>
                  {motoresVehiculo.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium">Año desde</label>
                <Input
                  type="number"
                  min={1900}
                  max={2100}
                  value={compatDraft.anio_desde}
                  onChange={(e) =>
                    setCompatDraft({
                      ...compatDraft,
                      anio_desde: e.target.value,
                    })
                  }
                  placeholder="1998"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Año hasta</label>
                <Input
                  type="number"
                  min={1900}
                  max={2100}
                  value={compatDraft.anio_hasta}
                  onChange={(e) =>
                    setCompatDraft({
                      ...compatDraft,
                      anio_hasta: e.target.value,
                    })
                  }
                  placeholder="2012"
                />
              </div>
            </div>

            {errors.compatibilidad && (
              <p className="text-xs text-destructive">{errors.compatibilidad}</p>
            )}

            <Button type="button" variant="outline" onClick={agregarCompatibilidad}>
              + Agregar compatibilidad
            </Button>

            {compatibilidadesAuto.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Compatibilidades agregadas:
                </p>

                {compatibilidadesAuto.map((c, index) => (
                  <div
                    key={`${c.marca_id}-${c.modelo_id}-${c.motor_id}-${c.anio_desde}-${c.anio_hasta}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span>
                      {(c.marca_nombre ?? nombreMarcaVehiculo(c.marca_id)) ||
                        `Marca ${c.marca_id}`}{" "}
                      /{" "}
                      {(c.modelo_nombre ??
                        nombreModeloVehiculo(c.modelo_id, c.modelo_nombre)) ||
                        `Modelo ${c.modelo_id}`}{" "}
                      /{" "}
                      {(c.motor_nombre ??
                        nombreMotorVehiculo(c.motor_id, c.motor_nombre)) ||
                        `Motor ${c.motor_id}`}{" "}
                      / {c.anio_desde}-{c.anio_hasta}
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarCompatibilidad(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
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