import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import logo from "@/assets/logo-el-turco.png";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/productos", icon: Package, label: "Productos" },
  { to: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { to: "/admin/clientes", icon: Users, label: "Clientes" },
  { to: "/admin/reportes", icon: BarChart3, label: "Reportes" },
  { to: "/admin/configuracion", icon: Settings, label: "Configuración" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const username = api.token.getUsername();

  const handleLogout = () => {
    api.auth.logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-foreground flex flex-col transition-transform`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <img src={logo} alt="" className="h-9 w-9 rounded-full ring-2 ring-secondary/40" />
          <div className="leading-none">
            <p className="font-heading font-black text-[10px] tracking-widest text-white/40 uppercase">Panel Admin</p>
            <p className="font-heading font-black text-secondary text-base leading-tight">El Turco</p>
          </div>
          <button className="ml-auto md:hidden p-1 text-white/60 hover:text-white" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-heading text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-white/50"}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-bold text-white/50 hover:bg-white/8 hover:text-white transition-all"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-bold text-white/50 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-20">
          <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-secondary inline-block" />
            <span className="font-heading font-black text-sm text-foreground">Panel de administración</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Hola, <strong className="text-foreground font-heading">{username}</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-primary text-white font-heading font-black flex items-center justify-center text-xs shadow-sm">
              {username.substring(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
