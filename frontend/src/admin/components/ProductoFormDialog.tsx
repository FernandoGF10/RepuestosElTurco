import { FormEvent, useEffect, useState } from "react";
import { Package, Tag, Layers, Boxes, FileText, ImageIcon, Car, Plus, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 shadow-sm">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

const inputCls =
  "h-11 rounded-lg border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60";

const textareaCls =
  "min-h-[110px] rounded-lg border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 placeholder:text-muted-foreground/60";

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
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[960px]">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border bg-card px-8 py-6 text-left">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                {producto ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {producto
                  ? "Actualiza los datos del producto."
                  : "Registra un nuevo repuesto en el catálogo."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto bg-muted/30 px-8 py-6">
            <div className="space-y-5">
              <Section
                icon={Tag}
                title="Información básica"
                description="Identificación del producto en el catálogo."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Código" required htmlFor="codigo" error={errors.codigo}>
                    <Input
                      id="codigo"
                      placeholder="AMG-009"
                      value={form.codigo}
                      onChange={(e) => set("codigo", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Marca del repuesto" required htmlFor="marca" error={errors.marca}>
                    <Input
                      id="marca"
                      placeholder="Bosch, Monroe, Valeo..."
                      value={form.marca}
                      onChange={(e) => set("marca", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Nombre" required htmlFor="nombre" error={errors.nombre}>
                  <Input
                    id="nombre"
                    placeholder="Amortiguador trasero"
                    value={form.nombre}
                    onChange={(e) => set("nombre", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </Section>

              <Section
                icon={Layers}
                title="Clasificación"
                description="Categoriza el repuesto para facilitar su búsqueda."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Familia" required error={errors.familia_id}>
                    <Select
                      value={familiaSeleccionada ? String(familiaSeleccionada) : ""}
                      onValueChange={(v) => {
                        const id = Number(v);
                        setFamiliaSeleccionada(id || null);
                        setSubfamiliaSeleccionada(null);
                      }}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Seleccione una familia" />
                      </SelectTrigger>
                      <SelectContent>
                        {familias.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Subfamilia" required error={errors.subfamilia_id}>
                    <Select
                      value={subfamiliaSeleccionada ? String(subfamiliaSeleccionada) : ""}
                      onValueChange={(v) => {
                        const id = Number(v);
                        setSubfamiliaSeleccionada(id || null);
                      }}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Seleccione una subfamilia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subfamilias
                          .filter((s) => s.familia_id === familiaSeleccionada)
                          .map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>

              <Section
                icon={Boxes}
                title="Inventario"
                description="Precio de venta y unidades disponibles."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Precio (CLP)" required htmlFor="precio" error={errors.precio}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="precio"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="0"
                        value={form.precio || ""}
                        onChange={(e) => set("precio", parseInt(e.target.value || "0", 10))}
                        className={`${inputCls} pl-7 text-base font-semibold tabular-nums`}
                      />
                    </div>
                  </Field>
                  <Field label="Stock" htmlFor="stock" error={errors.stock}>
                    <Input
                      id="stock"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => set("stock", parseInt(e.target.value || "0", 10))}
                      className={`${inputCls} text-base font-semibold tabular-nums`}
                    />
                  </Field>
                </div>
              </Section>

              <Section
                icon={FileText}
                title="Descripción"
                description="Contenido visible en la ficha pública del producto."
              >
                <Field label="Descripción corta" htmlFor="descripcion">
                  <Textarea
                    id="descripcion"
                    rows={2}
                    placeholder="Resumen visible en la tarjeta del producto."
                    value={form.descripcion}
                    onChange={(e) => set("descripcion", e.target.value)}
                    className={textareaCls}
                  />
                </Field>
                <Field label="Detalle completo" htmlFor="detalle">
                  <Textarea
                    id="detalle"
                    rows={4}
                    placeholder="Descripción técnica completa, materiales, garantía, etc."
                    value={form.detalle}
                    onChange={(e) => set("detalle", e.target.value)}
                    className={`${textareaCls} min-h-[140px]`}
                  />
                </Field>
              </Section>

              <Section
                icon={ImageIcon}
                title="Imagen"
                description="URL pública de la imagen del producto."
              >
                <Field label="URL de imagen" htmlFor="imagen" error={errors.imagen}>
                  <Input
                    id="imagen"
                    placeholder="https://... (jpg/png) — opcional"
                    value={form.imagen}
                    onChange={(e) => set("imagen", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </Section>

              <Section
                icon={Car}
                title="Compatibilidad del vehículo"
                description="Selecciona marca, modelo, motor y rango de años. Puedes agregar más de una compatibilidad."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="Marca vehículo">
                    <Select
                      value={compatDraft.marca_id}
                      onValueChange={(v) =>
                        setCompatDraft({
                          marca_id: v,
                          modelo_id: "",
                          motor_id: "",
                          anio_desde: compatDraft.anio_desde,
                          anio_hasta: compatDraft.anio_hasta,
                        })
                      }
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {marcasVehiculo.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Modelo">
                    <Select
                      value={compatDraft.modelo_id}
                      disabled={!compatDraft.marca_id}
                      onValueChange={(v) =>
                        setCompatDraft({
                          ...compatDraft,
                          modelo_id: v,
                          motor_id: "",
                        })
                      }
                    >
                      <SelectTrigger className={`${inputCls} disabled:opacity-60`}>
                        <SelectValue placeholder="Modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelosVehiculo.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Motor">
                    <Select
                      value={compatDraft.motor_id}
                      disabled={!compatDraft.modelo_id}
                      onValueChange={(v) =>
                        setCompatDraft({
                          ...compatDraft,
                          motor_id: v,
                        })
                      }
                    >
                      <SelectTrigger className={`${inputCls} disabled:opacity-60`}>
                        <SelectValue placeholder="Motor" />
                      </SelectTrigger>
                      <SelectContent>
                        {motoresVehiculo.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Año desde">
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
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Año hasta">
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
                      className={inputCls}
                    />
                  </Field>
                </div>

                {errors.compatibilidad && (
                  <p className="text-xs text-destructive">{errors.compatibilidad}</p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={agregarCompatibilidad}
                  className="h-10 gap-1.5 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Agregar compatibilidad
                </Button>

                {compatibilidadesAuto.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Compatibilidades agregadas:
                    </p>

                    {compatibilidadesAuto.map((c, index) => (
                      <div
                        key={`${c.marca_id}-${c.modelo_id}-${c.motor_id}-${c.anio_desde}-${c.anio_hasta}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      >
                        <span className="text-foreground">
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
                          className="h-8 gap-1 rounded-md text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-5 py-4">
                <Checkbox
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(c) => set("activo", Boolean(c))}
                />
                <Label
                  htmlFor="activo"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Producto activo{" "}
                  <span className="font-normal text-muted-foreground">
                    (visible en el catálogo público)
                  </span>
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border bg-card px-8 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg px-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg px-6 font-semibold shadow-sm"
            >
              {loading ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductoFormDialog;
