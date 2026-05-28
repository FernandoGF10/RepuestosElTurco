const brands = [
    { name: "Peugeot", logo: "/logos/peugeot.png" },
    { name: "Citroën", logo: "/logos/citroen.png" },
    { name: "Renault", logo: "/logos/renault.png" },
    { name: "Chevrolet", logo: "/logos/chevrolet.png" },
    { name: "DFM", logo: "/logos/dfm.png" },
    { name: "Opel", logo: "/logos/opel.png" },
];

const BrandStrip = () => (
    <section className="bg-muted/50 py-8 border-b border-border">
        <div className="container">
            <p className="text-center text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.2em] mb-6">
                Marcas con las que trabajamos
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                {brands.map((brand) => (
                    <div
                        key={brand.name}
                        className="flex flex-col items-center justify-center px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all w-[140px]"
                    >
            <span className="font-heading font-black text-sm md:text-base text-foreground/80 tracking-wider uppercase mb-3 text-center">
              {brand.name}
            </span>

                        <div className="w-16 h-16 flex items-center justify-center">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default BrandStrip;