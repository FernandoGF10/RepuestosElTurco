import { useEffect, useState } from "react";
import { UserCog, Plus, Edit2, Trash2, Shield, ShieldCheck, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type UsuarioOut } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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

type RolType = "admin" | "vendedor";

const ROL_CONFIG: Record<RolType, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Administrador", icon: ShieldCheck, color: "bg-primary/10 text-primary" },
  vendedor: { label: "Vendedor", icon: Shield, color: "bg-secondary/20 text-secondary-foreground" },
};

const fieldInputCls =
  "h-11 rounded-xl border-border bg-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60";

const fieldLabelCls = "text-[13px] font-semibold text-foreground";

const Usuarios = () => {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioOut[]>([]);
  const [loading, setLoading] = useState(true);

  // Mi cuenta
  const [miUsername, setMiUsername] = useState("");
  const [miPassword, setMiPassword] = useState("");
  const [miPasswordConfirm, setMiPasswordConfirm] = useState("");
  const [savingMe, setSavingMe] = useState(false);

  // Formulario nuevo usuario
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRol, setNewRol] = useState<RolType>("vendedor");
  const [creando, setCreando] = useState(false);

  // Editar usuario
  const [editando, setEditando] = useState<UsuarioOut | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRol, setEditRol] = useState<RolType>("vendedor");
  const [editActivo, setEditActivo] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Eliminar
  const [confirmDelete, setConfirmDelete] = useState<UsuarioOut | null>(null);

  const currentUsername = api.token.getUsername();
  const currentId = usuarios.find((u) => u.username === currentUsername)?.id;

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.usuarios.list();
      setUsuarios(data);
      const me = data.find((u) => u.username === currentUsername);
      if (me) setMiUsername(me.username);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSaveMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (miPassword && miPassword !== miPasswordConfirm) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (!currentId) return;
    setSavingMe(true);
    try {
      const payload: { username?: string; password?: string } = {};
      if (miUsername !== currentUsername) payload.username = miUsername;
      if (miPassword) payload.password = miPassword;
      if (!Object.keys(payload).length) {
        toast({ title: "No hay cambios para guardar" });
        return;
      }
      await api.usuarios.update(currentId, payload);
      if (payload.username) {
        api.token.set(api.token.get()!, payload.username, api.token.getRol());
      }
      toast({ title: "Credenciales actualizadas correctamente" });
      setMiPassword("");
      setMiPasswordConfirm("");
      cargar();
    } catch (err) {
      toast({ title: "Error al guardar", description: String(err), variant: "destructive" });
    } finally {
      setSavingMe(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;
    setCreando(true);
    try {
      await api.usuarios.create({ username: newUsername.trim(), password: newPassword, rol: newRol });
      toast({ title: `Usuario "${newUsername}" creado con rol ${newRol}` });
      setNewUsername(""); setNewPassword(""); setNewRol("vendedor"); setShowForm(false);
      cargar();
    } catch (err) {
      toast({ title: "Error al crear usuario", description: String(err), variant: "destructive" });
    } finally {
      setCreando(false);
    }
  };

  const openEdit = (u: UsuarioOut) => {
    setEditando(u);
    setEditUsername(u.username);
    setEditPassword("");
    setEditRol(u.rol as RolType);
    setEditActivo(u.activo);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setSavingEdit(true);
    try {
      const payload: { username?: string; password?: string; rol?: string; activo?: boolean } = {};
      if (editUsername !== editando.username) payload.username = editUsername;
      if (editPassword) payload.password = editPassword;
      if (editRol !== editando.rol) payload.rol = editRol;
      if (editActivo !== editando.activo) payload.activo = editActivo;
      await api.usuarios.update(editando.id, payload);
      toast({ title: "Usuario actualizado" });
      setEditando(null);
      cargar();
    } catch (err) {
      toast({ title: "Error al actualizar", description: String(err), variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.usuarios.delete(confirmDelete.id);
      toast({ title: `Usuario "${confirmDelete.username}" eliminado` });
      setConfirmDelete(null);
      cargar();
    } catch (err) {
      toast({ title: "No se puede eliminar", description: String(err), variant: "destructive" });
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading font-black text-2xl text-foreground">Gestión de usuarios</h2>
        <p className="text-sm text-muted-foreground">Actualiza tus credenciales o administra los accesos al panel.</p>
      </div>

      {/* Mi cuenta */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-heading font-black text-lg">Mi cuenta</h3>
        </div>

        <form onSubmit={handleSaveMe} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={fieldLabelCls}>Nombre de usuario</Label>
              <Input
                value={miUsername}
                onChange={(e) => setMiUsername(e.target.value)}
                className={fieldInputCls}
                placeholder="Tu usuario"
                minLength={3}
                required
              />
            </div>
            <div />
            <div className="space-y-1.5">
              <Label className={fieldLabelCls}>Nueva contraseña</Label>
              <Input
                type="password"
                value={miPassword}
                onChange={(e) => setMiPassword(e.target.value)}
                className={fieldInputCls}
                placeholder="Dejar vacío para no cambiar"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={fieldLabelCls}>Confirmar contraseña</Label>
              <Input
                type="password"
                value={miPasswordConfirm}
                onChange={(e) => setMiPasswordConfirm(e.target.value)}
                className={fieldInputCls}
                placeholder="Repetir nueva contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingMe} className="rounded-xl font-heading font-bold gap-2">
              <KeyRound className="w-4 h-4" />
              {savingMe ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-secondary-foreground" />
            </div>
            <h3 className="font-heading font-black text-lg">Usuarios del sistema</h3>
          </div>
          <Button
            onClick={() => { setShowForm(!showForm); setEditando(null); }}
            size="sm"
            className="rounded-xl font-heading font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </Button>
        </div>

        {/* Formulario nuevo usuario */}
        {showForm && (
          <form onSubmit={handleCrear} className="px-6 py-4 border-b border-border bg-muted/30 space-y-4">
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground">Nuevo usuario</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Usuario</Label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={fieldInputCls}
                  placeholder="nombre_usuario"
                  minLength={3}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Contraseña</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={fieldInputCls}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Rol</Label>
                <div className="flex gap-2 h-11">
                  {(["admin", "vendedor"] as RolType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRol(r)}
                      className={`flex-1 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                        newRol === r
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-border text-muted-foreground hover:text-foreground bg-background"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" className="rounded-xl font-heading font-bold" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={creando} className="rounded-xl font-heading font-bold">
                {creando ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        )}

        {/* Editar usuario inline */}
        {editando && (
          <form onSubmit={handleSaveEdit} className="px-6 py-4 border-b border-border bg-muted/30 space-y-4">
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground">Editando: {editando.username}</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Usuario</Label>
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className={fieldInputCls}
                  minLength={3}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Nueva contraseña</Label>
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className={fieldInputCls}
                  placeholder="Sin cambios"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Rol</Label>
                <div className="flex gap-2 h-11">
                  {(["admin", "vendedor"] as RolType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRol(r)}
                      className={`flex-1 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                        editRol === r
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "border-border text-muted-foreground hover:text-foreground bg-background"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelCls}>Estado</Label>
                <button
                  type="button"
                  onClick={() => setEditActivo(!editActivo)}
                  className={`w-full h-11 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all border ${
                    editActivo
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {editActivo ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" className="rounded-xl font-heading font-bold" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={savingEdit} className="rounded-xl font-heading font-bold">
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-6">Usuario</th>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Rol</th>
                <th className="text-center font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Estado</th>
                <th className="text-left font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-4 hidden md:table-cell">Creado</th>
                <th className="text-right font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground py-3 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-muted-foreground font-heading font-bold">Cargando...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-muted-foreground font-heading font-bold">No hay usuarios.</td>
                </tr>
              ) : (
                usuarios.map((u) => {
                  const rolCfg = ROL_CONFIG[u.rol as RolType] ?? ROL_CONFIG.vendedor;
                  const RolIcon = rolCfg.icon;
                  const isMe = u.username === currentUsername;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary text-white font-heading font-black flex items-center justify-center text-xs shadow-sm">
                            {u.username.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-foreground">{u.username}</p>
                            {isMe && <p className="text-[10px] text-muted-foreground">Sesión actual</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${rolCfg.color}`}>
                          <RolIcon className="w-3 h-3" />
                          {rolCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          u.activo ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(u.creado_en).toLocaleDateString("es-CL")}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            title="Editar"
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => setConfirmDelete(u)}
                              title="Eliminar"
                              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-black">¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar al usuario <strong>{confirmDelete?.username}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-heading font-bold rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white font-heading font-bold rounded-xl hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Usuarios;
