"use client";

import { SquareButton } from "./ui/SquareButton";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover opacity-60 grayscale-[0.2]"
                    poster="https://images.unsplash.com/photo-1531747118685-ca31677775d8?q=80&w=1920&auto=format&fit=crop"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-extreme-skateboarding-stunts-in-the-street-4251-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#001E36] via-transparent to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <span className="mb-4 inline-block bg-[#DB0A40] px-4 py-1 text-xs font-bold uppercase tracking-widest text-white italic">
                        Experiencia Premium
                    </span>
                    <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter text-white italic md:text-8xl lg:text-9xl">
                        Red Bull<br />
                        <span className="text-[#FFCC00]">Experiences</span>
                    </h1>
                    <p className="mb-10 text-lg font-medium text-white/80 md:text-2xl">
                        Acceso exclusivo a eventos de deportes extremos y entrenamiento con atletas de élite.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <SquareButton size="lg" variant="primary">
                            Comienza Tu Aventura
                        </SquareButton>
                        <SquareButton size="lg" variant="outline">
                            Ver Próximos Eventos
                        </SquareButton>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient for Transition to next sections */}
            <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-[#001E36] to-transparent" />
        </section>
    );
}
