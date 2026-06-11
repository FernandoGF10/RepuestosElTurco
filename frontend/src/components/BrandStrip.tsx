import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Marca {
    id: number;
    nombre: string;
    logo: string;
}

const BrandStrip = () => {
    const [marcas, setMarcas] = useState<Marca[]>([]);

    useEffect(() => {
        cargarMarcas();
    }, []);

    const cargarMarcas = async () => {
        try {
            const data = await api.marcasPublic.list();
            setMarcas(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="bg-muted/50 py-8 border-b border-border">
            <div className="container">
                <p className="text-center text-xs text-muted-foreground font-heading font-bold uppercase tracking-[0.2em] mb-6">
                    Marcas con las que trabajamos
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                    {marcas.map((marca) => (
                        <div
                            key={marca.id}
                            className="flex flex-col items-center justify-center px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all w-[140px]"
                        >
                            <span className="font-heading font-black text-sm md:text-base text-foreground/80 tracking-wider uppercase mb-3 text-center">
                                {marca.nombre}
                            </span>

                            <div className="w-16 h-16 flex items-center justify-center">
                                <img
                                    src={marca.logo}
                                    alt={marca.nombre}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandStrip;