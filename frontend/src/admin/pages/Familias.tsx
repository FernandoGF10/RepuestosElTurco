import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit2,
  FolderTree,
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

              return (
                <div key={familia.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
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
                          {subs.length} subfamilia
                          {subs.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editarFamilia(familia)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar familia"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => solicitarEliminarFamilia(familia)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
