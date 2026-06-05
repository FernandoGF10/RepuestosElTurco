import {
  Phone, MapPin, Clock, Mail, Facebook, Instagram, ArrowUp,
  Disc, Settings, ArrowUpDown, Navigation, Filter, Thermometer, Zap, Shield, MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-el-turco.png";

const categoriaIcons: Record<string, React.ReactNode> = {
  "Frenos":          <Disc className="w-4 h-4" />,
  "Motor":           <Settings className="w-4 h-4" />,
  "Suspensión":      <ArrowUpDown className="w-4 h-4" />,
  "Dirección":       <Navigation className="w-4 h-4" />,
  "Filtros y Aceites": <Filter className="w-4 h-4" />,
  "Calefacción":     <Thermometer className="w-4 h-4" />,
  "Eléctrico":       <Zap className="w-4 h-4" />,
};

const SiteFooter = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer style={{ backgroundColor: "#0d1b2e" }} className="text-white">

      {/* Grid principal */}
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">

          {/* Columna 1 — Marca */}
          <div className="pb-10 md:pb-0 md:pr-10 space-y-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Repuestos El Turco" className="h-16 w-16 rounded-full border-2 border-white/20 shrink-0" />
              <div>
                <span className="font-heading font-black text-xs text-white/50 block leading-none tracking-widest uppercase">Repuestos</span>
                <span className="font-heading font-black text-2xl leading-none" style={{ color: "#f5a623" }}>El Turco</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Tu tienda de confianza en repuestos automotrices. Compra online con atención personalizada y retiro directo en tienda.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/Turcorepuestos/?locale=es_ES"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-sm transition-all hover:brightness-110"
                style={{ backgroundColor: "#1877F2" }}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
              <a
                href="https://www.instagram.com/repuestos.elturco/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-sm transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>

          {/* Columna 2 — Categorías */}
          <div className="py-10 md:py-0 md:px-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1a3a5c" }}>
                <Settings className="w-4 h-4" style={{ color: "#4a9eff" }} />
              </div>
              <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">Categorías</h4>
            </div>
            <ul className="space-y-0">
              {Object.entries(categoriaIcons).map(([cat, icon]) => (
                <li key={cat}>
                  <a
                    href="/#repuestos"
                    className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0 text-white/60 hover:text-white transition-colors group"
                  >
                    <span className="text-white/40 group-hover:text-white/80 transition-colors">{icon}</span>
                    <span className="text-sm">{cat}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Nosotros */}
          <div className="py-10 md:py-0 md:px-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1a3a5c" }}>
                <Shield className="w-4 h-4" style={{ color: "#4a9eff" }} />
              </div>
              <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">Nosotros</h4>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              En Repuestos El Turco llevamos años brindando el mejor servicio y los mejores repuestos para tu vehículo. Trabajamos con marcas reconocidas como Monroe, Valeo, Bosch, Brembo, TRW, Gates, Ferodo y Mann Filter.
            </p>
            <Link
              to="/nosotros"
              className="inline-flex items-center gap-1.5 text-sm font-heading font-bold transition-all hover:brightness-125"
              style={{ color: "#f5a623" }}
            >
              Conoce nuestra historia →
            </Link>
          </div>

          {/* Columna 4 — Contacto */}
          <div className="pt-10 md:pt-0 md:pl-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1a3a5c" }}>
                <Phone className="w-4 h-4" style={{ color: "#4a9eff" }} />
              </div>
              <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">Contacto</h4>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { icon: <Phone className="w-4 h-4" />, text: "+56 9 77424442", href: "tel:+56977424442" },
                { icon: <MessageCircle className="w-4 h-4" />, text: "+56 9 66293400", href: "tel:+56966293400" },
                { icon: <Mail className="w-4 h-4" />, text: "contacto@repuestoselturco.cl", href: "mailto:contacto@repuestoselturco.cl" },
                { icon: <Clock className="w-4 h-4" />, text: "Lun-Vie 9-18h  |  Sáb 10-14h", href: null },
                { icon: <MapPin className="w-4 h-4" />, text: "Avenida el Olimpo 1635, local 4", href: null },
              ].map(({ icon, text, href }) => {
                const inner = (
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: "#1a3a5c" }}>
                      <span style={{ color: "#4a9eff" }}>{icon}</span>
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">{text}</span>
                  </div>
                );
                return href
                  ? <a key={text} href={href} className="block">{inner}</a>
                  : <div key={text}>{inner}</div>;
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-white/35 text-xs">
            <Shield className="w-4 h-4 shrink-0" />
            <span>© 2026 Repuestos El Turco.<br className="sm:hidden" /> Todos los derechos reservados.</span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
              <ArrowUp className="w-3 h-3" />
            </div>
            Volver arriba
          </button>
        </div>
      </div>

    </footer>
  );
};

export default SiteFooter;
