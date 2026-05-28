import { Phone, Clock, Search, Menu, X, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-el-turco.png";

interface SiteHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const SiteHeader = ({ searchTerm, onSearchChange, cartCount, onOpenCart }: SiteHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-foreground text-background text-xs py-1.5">
        <div className="container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <a href="tel:+56977424442" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Phone className="w-3 h-3" /> +56 9 77424442
            </a>
            <a href="tel:+56966293400" className="hidden sm:flex items-center gap-1 hover:text-secondary transition-colors">
              <Phone className="w-3 h-3" /> +56 9 66293400
            </a>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Lun-Vie 9:00-18:00 | Sáb 10:00-14:00
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-topbar shadow-lg">
        <div className="container flex items-center justify-between py-2.5 gap-4">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="Repuestos El Turco" className="h-12 w-12 rounded-full border-2 border-topbar-foreground/30 object-cover" />
            <div className="hidden lg:block">
              <span className="text-topbar-foreground font-heading font-black text-sm leading-none block">REPUESTOS</span>
              <span className="text-secondary font-heading font-black text-lg leading-none block">EL TURCO</span>
            </div>
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Buscar repuesto por nombre, código o marca..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg pl-4 pr-12 py-2.5 text-sm bg-topbar-foreground/10 text-topbar-foreground placeholder:text-topbar-foreground/50 border border-topbar-foreground/20 focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:bg-topbar-foreground/15 transition-all"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground rounded-md p-1.5 hover:brightness-110 transition-all">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "#inicio", label: "Inicio" },
              { href: "#repuestos", label: "Repuestos" },
              { href: "#nosotros", label: "Nosotros" },
              { href: "#contacto", label: "Contacto" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-topbar-foreground/90 hover:text-topbar-foreground hover:bg-topbar-foreground/10 font-heading text-xs font-bold px-3 py-2 rounded-md transition-all uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/login")} className="text-topbar-foreground/80 hover:text-topbar-foreground p-2 hover:bg-topbar-foreground/10 rounded-md transition-all hidden md:block" aria-label="Ir al panel de administración">
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenCart}
              className="text-topbar-foreground/80 hover:text-topbar-foreground p-2 hover:bg-topbar-foreground/10 rounded-md transition-all hidden md:block relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            </button>
            <button
              onClick={onOpenCart}
              className="md:hidden text-topbar-foreground p-2 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            </button>
            <button className="md:hidden text-topbar-foreground p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-topbar-foreground/20 px-4 pb-4 space-y-3 bg-topbar">
            <div className="relative pt-3">
              <input
                type="text"
                placeholder="Buscar repuesto..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg pl-4 pr-12 py-2.5 text-sm bg-topbar-foreground/10 text-topbar-foreground placeholder:text-topbar-foreground/50 border border-topbar-foreground/20 focus:outline-none focus:ring-2 focus:ring-secondary/60"
              />
              <button className="absolute right-1 top-1/2 mt-1.5 -translate-y-1/2 bg-secondary text-secondary-foreground rounded-md p-1.5">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col">
              {["Inicio", "Repuestos", "Nosotros", "Contacto"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-topbar-foreground font-heading text-sm font-bold border-b border-topbar-foreground/10 last:border-0"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
