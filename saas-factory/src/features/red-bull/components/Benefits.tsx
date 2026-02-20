import { Shield, Tv, Zap } from "lucide-react";
import { SquareCard } from "./ui/SquareCard";

const benefits = [
    {
        title: "Eventos Exclusivos",
        description: "Acceso garantizado a las zonas VIP de la UCI Mountain Bike World Cup y WRC.",
        icon: Shield,
    },
    {
        title: "Contenido Premium",
        description: "Documentales únicos sobre la preparación física y mental de Max Verstappen y atletas Pro.",
        icon: Tv,
    },
    {
        title: "Transmisión en Vivo",
        description: "Multi-cámara 4K en vivo desde el casco de los atletas en tiempo real.",
        icon: Zap,
    },
];

export function Benefits() {
    return (
        <section className="bg-[#001E36] py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <SquareCard key={index} className="flex flex-col items-center text-center group hover:border-[#DB0A40]/50 transition-all">
                            <div className="mb-6 p-4 bg-[#DB0A40]/10 text-[#DB0A40] group-hover:bg-[#DB0A40] group-hover:text-white transition-colors">
                                <benefit.icon size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase text-white italic mb-4">{benefit.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{benefit.description}</p>
                        </SquareCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
