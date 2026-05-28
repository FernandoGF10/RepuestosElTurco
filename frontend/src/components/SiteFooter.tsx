import { Phone, MapPin, Clock, Mail, Facebook, Instagram, ArrowUp } from "lucide-react";
import logo from "@/assets/logo-el-turco.png";
import { categorias } from "@/data/repuestos";

const SiteFooter = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* CTA section */}
      <section className="bg-primary">
        <div className="container py-10 text-center space-y-4">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-primary-foreground">
            ¿No encuentras tu repuesto?
          </h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto text-sm">
            Contáctanos y te ayudamos a reservar tu repuesto online para que puedas retirarlo directamente en tienda.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/56977424442?text=Hola, necesito ayuda para encontrar un repuesto"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary text-secondary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg hover:brightness-110 transition-all"
            >
              Escribir por WhatsApp
            </a>
            <a
              href="tel:+56977424442"
              className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-heading font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary-foreground/20 transition-all"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-foreground text-card">
        <div className="container py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Repuestos El Turco" className="h-14 w-14 rounded-full border-2 border-card/20" />
              <div>
                <span className="font-heading font-black text-sm text-card/70 block leading-none">REPUESTOS</span>
                <span className="font-heading font-black text-xl text-secondary block leading-none">EL TURCO</span>
              </div>
            </div>
            <p className="text-sm text-card/60 leading-relaxed">
              Tu tienda de confianza en repuestos automotrices. Compra online con atención personalizada y retiro directo en tienda.
            </p>
            <div className="flex gap-2">
              <a href="https://www.facebook.com/Turcorepuestos/?locale=es_ES&_rdr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/40 border border-[#1877F2]/30 hover:border-[#1877F2]/60 px-3 py-2 rounded-lg transition-all">
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                <span className="text-xs font-heading font-bold text-card/80">Facebook</span>
              </a>
              <a href="https://www.instagram.com/repuestos.elturco/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#E1306C]/20 hover:bg-[#E1306C]/40 border border-[#E1306C]/30 hover:border-[#E1306C]/60 px-3 py-2 rounded-lg transition-all">
                <Instagram className="w-4 h-4 text-[#E1306C]" />
                <span className="text-xs font-heading font-bold text-card/80">Instagram</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-card/90">Categorías</h4>
            <ul className="space-y-2">
              {categorias.filter(c => c !== "Todos").map(cat => (
                <li key={cat}>
                  <a href="#repuestos" className="text-sm text-card/50 hover:text-secondary transition-colors">{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div id="nosotros" className="space-y-4">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-card/90">Nosotros</h4>
            <p className="text-sm text-card/50 leading-relaxed">
              En Repuestos El Turco llevamos años brindando el mejor servicio y los mejores repuestos para tu vehículo. Trabajamos con marcas reconocidas como Monroe, Valeo, Bosch, Brembo, TRW, Gates, Ferodo y Mann Filter.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-card/90">Contacto</h4>
            <div className="space-y-3 text-sm">
              <a href="tel:+56977424442" className="flex items-center gap-2.5 text-card/50 hover:text-secondary transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> +56 9 77424442
              </a>
              <a href="tel:+56966293400" className="flex items-center gap-2.5 text-card/50 hover:text-secondary transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> +56 9 66293400
              </a>
              <a href="mailto:contacto@repuestoselturco.cl" className="flex items-center gap-2.5 text-card/50 hover:text-secondary transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> contacto@repuestoselturco.cl
              </a>
              <p className="flex items-center gap-2.5 text-card/50">
                <Clock className="w-4 h-4 shrink-0" /> Lun-Vie 9-18h | Sáb 10-14h
              </p>
              <p className="flex items-center gap-2.5 text-card/50">
                <MapPin className="w-4 h-4 shrink-0" /> Santiago, Chile
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-card/10">
          <div className="container py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-card/40">
            <p>© 2026 Repuestos El Turco. Todos los derechos reservados.</p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-card/70 transition-colors"
            >
              <ArrowUp className="w-3 h-3" /> Volver arriba
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SiteFooter;
