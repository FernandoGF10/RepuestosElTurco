import { useEffect, useMemo, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit2,
  FolderTree,
  GripVertical,
  ImageIcon,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Familia {
  id: number;
  nombre: string;
  imagen?: string;
  posicion: number;
}

interface Subfamilia {
  id: number;
  nombre: string;
  familia_id: number;
}

type DeleteTarget =
  | {
      tipo: "familia";
      id: number;
      nombre: string;
    }
  | {
      tipo: "subfamilia";
      id: number;
      nombre: string;
    };

const emptyFamilia = {
  nombre: "",
  imagen: "",
};

const emptySubfamilia = {
  nombre: "",
  familia_id: "",
};

const Familias = () => {
  const { toast } = useToast();

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [search, setSearch] = useState("");

  const [familiaForm, setFamiliaForm] = useState(emptyFamilia);
  const [subfamiliaForm, setSubfamiliaForm] = useState(emptySubfamilia);

  const [editingFamilia, setEditingFamilia] = useState<Familia | null>(null);
  const [editingSubfamilia, setEditingSubfamilia] =
    useState<Subfamilia | null>(null);

  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [loadingSubfamilia, setLoadingSubfamilia] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [draggedFamiliaId, setDraggedFamiliaId] = useState<number | null>(null);
  const [dragOverFamiliaId, setDragOverFamiliaId] = useState<number | null>(
    null
  );
  const [ordenando, setOrdenando] = useState(false);

  const cargar = async () => {
    try {
      const [familiasData, subfamiliasData] = await Promise.all([
        api.familias.list(),
        api.subfamilias.list(),
      ]);

      setFamilias(familiasData as Familia[]);
      setSubfamilias(subfamiliasData as Subfamilia[]);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las familias.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const familiasFiltradas = useMemo(() => {
    const t = search.toLowerCase().trim();

    if (!t) return familias;

    return familias.filter((f) => {
      const subDeFamilia = subfamilias.filter((s) => s.familia_id === f.id);

      return (
        f.nombre.toLowerCase().includes(t) ||
        subDeFamilia.some((s) => s.nombre.toLowerCase().includes(t))
      );
    });
  }, [familias, subfamilias, search]);

  const getFamiliaNombre = (familiaId: number) => {
    return familias.find((f) => f.id === familiaId)?.nombre ?? "Sin familia";
  };

  const guardarOrdenFamilias = async (nuevoOrden: Familia[]) => {
    const familiasConPosicion = nuevoOrden.map((familia, index) => ({
      ...familia,
      posicion: index + 1,
    }));

    setFamilias(familiasConPosicion);
    setOrdenando(true);

    try {
      await api.familias.ordenar(
        familiasConPosicion.map((familia) => ({
          id: familia.id,
          posicion: familia.posicion,
        }))
      );

      toast({
        title: "Orden actualizado",
        description: "La posición de las familias se guardó correctamente.",
      });
    } catch (err) {
      await cargar();

      toast({
        title: "No se pudo ordenar",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setOrdenando(false);
      setDraggedFamiliaId(null);
      setDragOverFamiliaId(null);
    }
  };

  const moverFamilia = async (
    familiaId: number,
    direccion: "arriba" | "abajo"
  ) => {
    const indiceActual = familias.findIndex((f) => f.id === familiaId);
    const indiceNuevo =
      direccion === "arriba" ? indiceActual - 1 : indiceActual + 1;

    if (indiceActual < 0 || indiceNuevo < 0 || indiceNuevo >= familias.length) {
      return;
    }

    const nuevoOrden = [...familias];

    [nuevoOrden[indiceActual], nuevoOrden[indiceNuevo]] = [
      nuevoOrden[indiceNuevo],
      nuevoOrden[indiceActual],
    ];

    await guardarOrdenFamilias(nuevoOrden);
  };

  const moverFamiliaPorArrastre = async (
    familiaOrigenId: number,
    familiaDestinoId: number
  ) => {
    if (familiaOrigenId === familiaDestinoId) {
      setDraggedFamiliaId(null);
      setDragOverFamiliaId(null);
      return;
    }

    const indiceOrigen = familias.findIndex((f) => f.id === familiaOrigenId);
    const indiceDestino = familias.findIndex((f) => f.id === familiaDestinoId);

    if (indiceOrigen < 0 || indiceDestino < 0) {
      setDraggedFamiliaId(null);
      setDragOverFamiliaId(null);
      return;
    }

    const nuevoOrden = [...familias];
    const [familiaMovida] = nuevoOrden.splice(indiceOrigen, 1);

    nuevoOrden.splice(indiceDestino, 0, familiaMovida);

    await guardarOrdenFamilias(nuevoOrden);
  };

  const handleDragStartFamilia = (
    e: DragEvent<HTMLDivElement>,
    familiaId: number
  ) => {
    if (ordenando) return;

    setDraggedFamiliaId(familiaId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(familiaId));
  };

  const handleDragOverFamilia = (
    e: DragEvent<HTMLDivElement>,
    familiaId: number
  ) => {
    e.preventDefault();

    if (draggedFamiliaId && draggedFamiliaId !== familiaId) {
      setDragOverFamiliaId(familiaId);
    }
  };

  const handleDropFamilia = async (
    e: DragEvent<HTMLDivElement>,
    familiaDestinoId: number
  ) => {
    e.preventDefault();

    const idDesdeTransferencia = Number(e.dataTransfer.getData("text/plain"));
    const familiaOrigenId = idDesdeTransferencia || draggedFamiliaId;

    if (!familiaOrigenId) {
      setDraggedFamiliaId(null);
      setDragOverFamiliaId(null);
      return;
    }

    await moverFamiliaPorArrastre(familiaOrigenId, familiaDestinoId);
  };

  const handleDragEndFamilia = () => {
    setDraggedFamiliaId(null);
    setDragOverFamiliaId(null);
  };

  const handleSubmitFamilia = async (e: FormEvent) => {
    e.preventDefault();

    const nombre = familiaForm.nombre.trim();

    if (!nombre) {
      toast({
        title: "Nombre obligatorio",
        description: "Debes ingresar el nombre de la familia.",
        variant: "destructive",
      });
      return;
    }

    setLoadingFamilia(true);

    try {
      if (editingFamilia) {
        await api.familias.update(editingFamilia.id, {
          nombre,
          imagen: familiaForm.imagen.trim(),
        });

        toast({
          title: "Familia actualizada",
          description: nombre,
        });
      } else {
        await api.familias.create({
          nombre,
          imagen: familiaForm.imagen.trim(),
        });

        toast({
          title: "Familia creada",
          description: nombre,
        });
      }

      setFamiliaForm(emptyFamilia);
      setEditingFamilia(null);
      await cargar();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoadingFamilia(false);
    }
  };

  const handleSubmitSubfamilia = async (e: FormEvent) => {
    e.preventDefault();

    const nombre = subfamiliaForm.nombre.trim();
    const familiaId = Number(subfamiliaForm.familia_id);

    if (!nombre) {
      toast({
        title: "Nombre obligatorio",
        description: "Debes ingresar el nombre de la subfamilia.",
        variant: "destructive",
      });
      return;
    }

    if (!familiaId) {
      toast({
        title: "Familia obligatoria",
        description: "Debes seleccionar una familia para la subfamilia.",
        variant: "destructive",
      });
      return;
    }

    setLoadingSubfamilia(true);

    try {
      if (editingSubfamilia) {
        await api.subfamilias.update(editingSubfamilia.id, {
          nombre,
          familia_id: familiaId,
        });

        toast({
          title: "Subfamilia actualizada",
          description: nombre,
        });
      } else {
        await api.subfamilias.create({
          nombre,
          familia_id: familiaId,
        });

        toast({
          title: "Subfamilia creada",
          description: nombre,
        });
      }

      setSubfamiliaForm(emptySubfamilia);
      setEditingSubfamilia(null);
      await cargar();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoadingSubfamilia(false);
    }
  };

  const editarFamilia = (familia: Familia) => {
    setEditingFamilia(familia);
    setFamiliaForm({
      nombre: familia.nombre,
      imagen: familia.imagen ?? "",
    });
  };

  const editarSubfamilia = (subfamilia: Subfamilia) => {
    setEditingSubfamilia(subfamilia);
    setSubfamiliaForm({
      nombre: subfamilia.nombre,
      familia_id: String(subfamilia.familia_id),
    });
  };

  const cancelarEdicionFamilia = () => {
    setEditingFamilia(null);
    setFamiliaForm(emptyFamilia);
  };

  const cancelarEdicionSubfamilia = () => {
    setEditingSubfamilia(null);
    setSubfamiliaForm(emptySubfamilia);
  };

  const solicitarEliminarFamilia = (familia: Familia) => {
    setDeleteTarget({
      tipo: "familia",
      id: familia.id,
      nombre: familia.nombre,
    });
  };

  const solicitarEliminarSubfamilia = (subfamilia: Subfamilia) => {
    setDeleteTarget({
      tipo: "subfamilia",
      id: subfamilia.id,
      nombre: subfamilia.nombre,
    });
  };

  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      if (deleteTarget.tipo === "familia") {
        await api.familias.delete(deleteTarget.id);

        toast({
          title: "Familia eliminada",
          description: deleteTarget.nombre,
        });
      } else {
        await api.subfamilias.delete(deleteTarget.id);

        toast({
          title: "Subfamilia eliminada",
          description: deleteTarget.nombre,
        });
      }

      setDeleteTarget(null);
      await cargar();
    } catch (err) {
      toast({
        title: "No se pudo eliminar",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-2xl text-foreground">
            Familias y subfamilias
          </h2>

          <p className="text-sm text-muted-foreground">
            Administra las familias y subfamilias que aparecen en el catálogo y
            en el formulario de productos.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar familia o subfamilia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-border bg-background pl-9 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmitFamilia}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div>
            <h3 className="font-heading font-black text-lg text-foreground">
              {editingFamilia ? "Editar familia" : "Nueva familia"}
            </h3>

            <p className="text-sm text-muted-foreground">
              Ejemplo: Motor, Frenos, Suspensión, Filtros.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-foreground">
              Nombre<span className="ml-0.5 text-destructive">*</span>
            </Label>

            <Input
              value={familiaForm.nombre}
              onChange={(e) =>
                setFamiliaForm((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }))
              }
              placeholder="Motor"
              className="h-11 rounded-xl border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-foreground">
              URL de imagen
            </Label>

            <Input
              value={familiaForm.imagen}
              onChange={(e) =>
                setFamiliaForm((prev) => ({
                  ...prev,
                  imagen: e.target.value,
                }))
              }
              placeholder="https://... o /img/categorias/motor.png"
              className="h-11 rounded-xl border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
            />

            <p className="text-xs text-muted-foreground mt-1">
              Esta imagen se mostrará en el carrusel de familias del catálogo.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={loadingFamilia}
              className="rounded-xl font-heading font-bold"
            >
              <Plus className="w-4 h-4 mr-1" />

              {loadingFamilia
                ? "Guardando..."
                : editingFamilia
                  ? "Guardar familia"
                  : "Crear familia"}
            </Button>

            {editingFamilia && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelarEdicionFamilia}
                className="rounded-xl font-heading font-bold"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>

        <form
          onSubmit={handleSubmitSubfamilia}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div>
            <h3 className="font-heading font-black text-lg text-foreground">
              {editingSubfamilia ? "Editar subfamilia" : "Nueva subfamilia"}
            </h3>

            <p className="text-sm text-muted-foreground">
              Ejemplo: Amortiguadores dentro de Suspensión.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-foreground">
              Familia<span className="ml-0.5 text-destructive">*</span>
            </Label>

            <Select
              value={subfamiliaForm.familia_id}
              onValueChange={(v) =>
                setSubfamiliaForm((prev) => ({
                  ...prev,
                  familia_id: v,
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60">
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-foreground">
              Nombre<span className="ml-0.5 text-destructive">*</span>
            </Label>

            <Input
              value={subfamiliaForm.nombre}
              onChange={(e) =>
                setSubfamiliaForm((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }))
              }
              placeholder="Amortiguadores"
              className="h-11 rounded-xl border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={loadingSubfamilia}
              className="rounded-xl font-heading font-bold"
            >
              <Plus className="w-4 h-4 mr-1" />

              {loadingSubfamilia
                ? "Guardando..."
                : editingSubfamilia
                  ? "Guardar subfamilia"
                  : "Crear subfamilia"}
            </Button>

            {editingSubfamilia && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelarEdicionSubfamilia}
                className="rounded-xl font-heading font-bold"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-primary" />

          <h3 className="font-heading font-black text-lg text-foreground">
            Familias registradas
          </h3>

          <span className="ml-auto text-xs text-muted-foreground">
            Arrastra una familia para cambiar su posición
          </span>
        </div>

        <div className="divide-y divide-border">
          {familiasFiltradas.length === 0 ? (
            <div className="py-14 text-center text-muted-foreground font-heading font-bold">
              No hay familias que coincidan.
            </div>
          ) : (
            familiasFiltradas.map((familia) => {
              const subs = subfamilias.filter(
                (s) => s.familia_id === familia.id
              );

              const posicionActual = familias.findIndex(
                (f) => f.id === familia.id
              );
              const esPrimera = posicionActual <= 0;
              const esUltima = posicionActual === familias.length - 1;

              const estaSiendoArrastrada = draggedFamiliaId === familia.id;
              const esDestino =
                dragOverFamiliaId === familia.id &&
                draggedFamiliaId !== familia.id;

              return (
                <div
                  key={familia.id}
                  draggable={!ordenando}
                  onDragStart={(e) => handleDragStartFamilia(e, familia.id)}
                  onDragOver={(e) => handleDragOverFamilia(e, familia.id)}
                  onDrop={(e) => handleDropFamilia(e, familia.id)}
                  onDragEnd={handleDragEndFamilia}
                  className={[
                    "p-5 transition-all duration-150",
                    ordenando
                      ? "opacity-70 pointer-events-none"
                      : "cursor-grab active:cursor-grabbing",
                    estaSiendoArrastrada ? "opacity-40 bg-muted/60" : "",
                    esDestino ? "bg-primary/10 ring-2 ring-primary/30" : "",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="text-muted-foreground cursor-grab active:cursor-grabbing"
                        title="Arrastrar familia"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {familia.imagen ? (
                          <img
                            src={familia.imagen}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <p className="font-heading font-black text-foreground">
                          {familia.nombre}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Posición {posicionActual + 1} · {subs.length}{" "}
                          subfamilia{subs.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moverFamilia(familia.id, "arriba")}
                        disabled={esPrimera || ordenando}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Subir familia"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moverFamilia(familia.id, "abajo")}
                        disabled={esUltima || ordenando}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Bajar familia"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => editarFamilia(familia)}
                        disabled={ordenando}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Editar familia"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => solicitarEliminarFamilia(familia)}
                        disabled={ordenando}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Eliminar familia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {subs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Esta familia todavía no tiene subfamilias.
                      </p>
                    ) : (
                      subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">
                            {sub.nombre}
                          </span>

                          <button
                            type="button"
                            onClick={() => editarSubfamilia(sub)}
                            className="text-muted-foreground hover:text-primary"
                            title="Editar subfamilia"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => solicitarEliminarSubfamilia(sub)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Eliminar subfamilia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingSubfamilia && (
        <div className="text-xs text-muted-foreground">
          Editando subfamilia: <strong>{editingSubfamilia.nombre}</strong> de{" "}
          <strong>{getFamiliaNombre(editingSubfamilia.familia_id)}</strong>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <DialogTitle>
              {deleteTarget?.tipo === "familia"
                ? "Eliminar familia"
                : "Eliminar subfamilia"}
            </DialogTitle>

            <DialogDescription>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-foreground">
                {deleteTarget?.nombre}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            {deleteTarget?.tipo === "familia" ? (
              <>
                Solo podrás eliminar esta familia si no tiene subfamilias ni
                productos asociados.
              </>
            ) : (
              <>
                Solo podrás eliminar esta subfamilia si no tiene productos
                asociados.
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl font-heading font-bold"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={confirmarEliminacion}
              disabled={deleting}
              className="rounded-xl font-heading font-bold"
            >
              {deleting ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Familias;