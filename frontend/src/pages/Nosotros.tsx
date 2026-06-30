import { Link } from "react-router-dom";
import { ArrowLeft, Store, Users, MapPin } from "lucide-react";
import logo from "../../public/img/logo-el-turco.png";
import SiteFooter from "@/components/SiteFooter";

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

        {/* Historia en cards */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <div className="mb-10">
              <h2 className="font-heading font-black text-2xl text-foreground">Nuestro camino</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Card 2014 */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-heading font-bold text-secondary uppercase tracking-widest">2014 — Los comienzos</span>
                  <h3 className="font-heading font-bold text-lg text-foreground">Fundación de la empresa</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Esta empresa fue creada el año 2014 con el objetivo de acercar los repuestos automotrices a la comunidad.
                  </p>
                </div>
              </div>

              {/* Card Primer local */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-heading font-bold text-primary uppercase tracking-widest">Primer local</span>
                  <h3 className="font-heading font-bold text-lg text-foreground">Sirviendo a la comunidad</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Empezamos en un local pequeño para satisfacer a los clientes de Maipú, Cerrillos, Padre Hurtado y alrededores, que necesitaban repuestos de la línea francesa sin ir a Santiago.
                  </p>
                </div>
              </div>

              {/* Card Crecimiento */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-heading font-bold text-secondary uppercase tracking-widest">Crecimiento</span>
                  <h3 className="font-heading font-bold text-lg text-foreground">Nueva sucursal</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Con el tiempo sumamos más vendedores especializados y abrimos una segunda sucursal en la misma comuna de Maipú para brindar una mejor atención.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Collage de fotos */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl">
            <div className="text-center mb-10 space-y-2">
              <span className="inline-block bg-secondary/20 text-secondary text-xs font-heading font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Galería
              </span>
              <h2 className="font-heading font-black text-3xl text-foreground">Así somos nosotros</h2>
              <p className="text-muted-foreground text-sm">El equipo, el local y el día a día de Repuestos El Turco.</p>
            </div>

            {/* Collage grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[700px]">
              {/* Foto grande izquierda — ocupa 2 columnas y 2 filas */}
              <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-md">
                <img src="/img/turco-1.jpeg" alt="Repuestos El Turco" className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Foto top center */}
              <div className="overflow-hidden rounded-2xl shadow-md">
                <img src="/img/turco-2.jpeg" alt="Repuestos El Turco" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Foto top right */}
              <div className="overflow-hidden rounded-2xl shadow-md">
                <img src="/img/turco-3.jpeg" alt="Repuestos El Turco" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Foto bottom center */}
              <div className="overflow-hidden rounded-2xl shadow-md">
                <img src="/img/turco-4.jpeg" alt="Repuestos El Turco" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Foto bottom right */}
              <div className="overflow-hidden rounded-2xl shadow-md">
                <img src="/img/turco-5.jpeg" alt="Repuestos El Turco" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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

      <SiteFooter />
    </div>
  );
};

export default Nosotros;
