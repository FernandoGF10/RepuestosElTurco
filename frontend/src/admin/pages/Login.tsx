import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import logo from "../../../public/img/logo-el-turco.png";

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user.trim() || !pass) {
      setError("Debes ingresar usuario y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await api.auth.login(user.trim(), pass);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-20 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_hsl(var(--secondary))_0%,_transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="Repuestos El Turco" className="h-64 w-64 rounded-full border-2 border-secondary/40" />
          <div className="leading-tight">
            <p className="font-heading font-black text-3xl text-background/60">REPUESTOS</p>
            <p className="font-heading font-black text-secondary text-6xl">EL TURCO</p>
          </div>
        </div>
        <div className="relative space-y-4">
          <h2 className="font-heading font-black text-3xl">Panel de administración</h2>
          <p className="text-background/70 max-w-sm leading-relaxed">
            Gestiona productos, stock, pedidos, clientes y reportes de tu negocio desde un único lugar.
          </p>
          <div className="flex items-center gap-2 text-sm text-background/60">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            Acceso seguro restringido a personal autorizado.
          </div>
        </div>
        <p className="relative text-xs text-background/40">© 2026 Repuestos El Turco</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <img src={logo} alt="" className="h-12 w-12 rounded-full" />
            <div>
              <p className="font-heading font-black text-xs text-muted-foreground">REPUESTOS</p>
              <p className="font-heading font-black text-primary text-lg">EL TURCO</p>
            </div>
          </div>

          <div>
            <h1 className="font-heading font-black text-2xl text-foreground">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales de administrador.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="user" className="text-sm font-medium text-foreground">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="user"
                  className="pl-9"
                  placeholder="admin"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pass"
                  className="pl-9 pr-9"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Validando..." : "Iniciar sesión"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
