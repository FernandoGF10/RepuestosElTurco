import { Link } from "react-router-dom";
import { ArrowLeft, Store, Users, MapPin } from "lucide-react";
import logo from "@/assets/logo-el-turco.png";

const Nosotros = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-full" />
            <span className="font-heading font-black text-sm text-foreground">Repuestos El Turco</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-foreground text-card py-16">
          <div className="container max-w-3xl text-center space-y-4">
            <span className="inline-block bg-secondary/20 text-secondary text-xs font-heading font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Nuestra historia
            </span>
            <h1 className="font-heading font-black text-4xl md:text-5xl leading-tight">
              Repuestos El Turco
            </h1>
            <p className="text-card/60 text-lg">
              Más de una década acompañando a los conductores de Maipú y alrededores.
            </p>
          </div>
        </section>

        {/* Historia con imagen de fondo */}
        <section className="relative py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/img/local-turco.jpeg')" }}
          />
          <div className="absolute inset-0 bg-white/80" />
          <div className="relative container max-w-3xl space-y-0 z-10">
          <div className="mb-8">
            <h2 className="font-heading font-black text-2xl text-foreground">Nuestro camino</h2>
          </div>

          {/* 2014 */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="w-0.5 flex-1 bg-border mt-3" />
            </div>
            <div className="pb-10 space-y-3">
              <span className="text-xs font-heading font-bold text-secondary uppercase tracking-widest">2014 — Los comienzos</span>
              <h3 className="font-heading font-bold text-xl text-foreground">Fundación de la empresa</h3>
              <p className="text-muted-foreground leading-relaxed">
                Esta Empresa Fue Creada el año 2014
              </p>
            </div>
          </div>

          {/* Primer local */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="w-0.5 flex-1 bg-border mt-3" />
            </div>
            <div className="pb-10 space-y-3">
              <span className="text-xs font-heading font-bold text-primary uppercase tracking-widest">Primer local</span>
              <h3 className="font-heading font-bold text-xl text-foreground">Sirviendo a la comunidad</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empezamos en un local pequeño para poder satisfacer a los clientes en la comuna de Maipú, Cerrillos, Padre Hurtado y alrededores, los cuales necesitaban repuestos automotrices de la línea francesa y no tenían que ir a Santiago a buscarlos.
              </p>
            </div>
          </div>

          {/* Crecimiento */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-heading font-bold text-secondary uppercase tracking-widest">Crecimiento</span>
              <h3 className="font-heading font-bold text-xl text-foreground">Nueva sucursal</h3>
              <p className="text-muted-foreground leading-relaxed">
                En el transcurso de los años necesitábamos más vendedores especializados en la marca y brindarles mejor atención a los clientes, por eso hemos abierto una sucursal en la misma comuna de Maipú.
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary">
          <div className="container max-w-3xl py-12 text-center space-y-4">
            <h2 className="font-heading font-black text-2xl text-primary-foreground">
              ¿Necesitas un repuesto?
            </h2>
            <p className="text-primary-foreground/70 text-sm">
              Visítanos en tienda o compra directamente en nuestra web.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="bg-secondary text-secondary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg hover:brightness-110 transition-all"
              >
                Ver repuestos
              </Link>
              <a
                href="https://wa.me/56977424442?text=Hola, necesito ayuda para encontrar un repuesto"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-heading font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary-foreground/20 transition-all"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-card py-4">
        <div className="container text-center text-xs text-card/40">
          © 2026 Repuestos El Turco. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Nosotros;
