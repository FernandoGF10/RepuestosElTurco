import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Truck, Headphones } from "lucide-react";

const SLIDES = [
    "/img/fondo-turco.png",
    "/img/img.png",
    "/img/horario.png",
];

const AUTOPLAY_MS = 5000;

const HeroBanner = () => {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const goTo = useCallback((index: number) => {
        setCurrent((index + SLIDES.length) % SLIDES.length);
    }, []);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // Autoplay
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((c) => (c + 1) % SLIDES.length);
        }, AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, []);

    // Soporte para deslizar con el dedo (mobile)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (deltaX > 50) prev();
        else if (deltaX < -50) next();
        touchStartX.current = null;
    };

    return (
        <section id="inicio">
            {/* Hero */}
            <div
                className="relative h-[620px] md:h-[820px] overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {SLIDES.map((src, index) => (
                    <img
                        key={src}
                        src={src}
                        alt="Repuestos automotrices"
                        className={`absolute inset-0 w-full h-full object-cover object-[center_60%] transition-opacity duration-1000 ease-in-out ${
                            index === current ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

                {/* Content */}
                <div className="relative container h-full flex flex-col justify-center gap-5 z-10">
                    <div className="inline-flex items-center gap-2 bg-secondary/90 text-secondary-foreground px-3 py-1 rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-secondary-foreground animate-pulse" />

                        <span className="font-heading text-xs font-bold uppercase tracking-wider">
              Compra online
            </span>
                    </div>

                    <h1 className="font-heading text-white text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] max-w-2xl drop-shadow-lg">
                        Tu repuesto <span className="text-secondary">ideal</span>,
                        <br />
                        al mejor precio
                    </h1>

                    <p className="text-white/90 max-w-md text-sm md:text-base leading-relaxed drop-shadow-md">
                        Más de 5.000 repuestos automotrices para Renault, Peugeot,
                        Citroën, Chevrolet y DFM. Compra online y retira directamente
                        en tienda con atención personalizada.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#repuestos"
                            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold text-sm px-6 py-3 rounded-lg hover:brightness-110 transition-all shadow-xl"
                        >
                            Ver Catálogo <ArrowRight className="w-4 h-4" />
                        </a>

                        <a
                            href="https://wa.me/56977424442"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-heading font-bold text-sm px-6 py-3 rounded-lg hover:bg-white/20 transition-all backdrop-blur-sm"
                        >
                            Contactar Asesor
                        </a>
                    </div>
                </div>

                {/* Flechas de navegación */}
                <button
                    type="button"
                    onClick={prev}
                    aria-label="Imagen anterior"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={next}
                    aria-label="Imagen siguiente"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Puntos indicadores */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={`Ir a la imagen ${index + 1}`}
                            className={`h-2 rounded-full transition-all ${
                                index === current
                                    ? "w-8 bg-secondary"
                                    : "w-2 bg-white/50 hover:bg-white/80"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Trust bar */}
            <div className="bg-card border-b border-border">
                <div className="container py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            icon: Truck,
                            title: "Retiro en tienda",
                            desc: "Compra online y retira en el local",
                        },
                        {
                            icon: Shield,
                            title: "Garantía en productos",
                            desc: "Calidad certificada OEM",
                        },
                        {
                            icon: Headphones,
                            title: "Asesoría experta",
                            desc: "Te ayudamos a encontrar tu repuesto",
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3">
                            <div className="bg-accent rounded-lg p-2.5 shrink-0">
                                <Icon className="w-5 h-5 text-accent-foreground" />
                            </div>

                            <div>
                                <p className="font-heading font-bold text-sm text-foreground">
                                    {title}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;