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
import { logout, getSession } from "@/lib/adminStore";
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
  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-foreground text-background flex flex-col transition-transform`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-background/10">
          <img src={logo} alt="" className="h-10 w-10 rounded-full border border-background/20" />
          <div className="leading-tight">
            <p className="font-heading font-black text-xs text-background/60">PANEL ADMIN</p>
            <p className="font-heading font-black text-secondary text-sm">EL TURCO</p>
          </div>
          <button className="ml-auto md:hidden p-1" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md font-heading text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-background/70 hover:bg-background/10 hover:text-background"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-background/10 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-background/70 hover:bg-background/10 hover:text-background transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-background/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border h-14 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-20">
          <button className="md:hidden p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-foreground">Panel de administración</h1>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-muted-foreground">
              Hola, <strong className="text-foreground">{session?.user ?? "admin"}</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-heading font-bold flex items-center justify-center text-xs">
              {(session?.user ?? "A").substring(0, 1).toUpperCase()}
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
