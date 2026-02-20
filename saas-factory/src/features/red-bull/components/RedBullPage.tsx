"use client";

import { Hero } from "@/features/red-bull/components/Hero";
import { RegisterForm } from "@/features/red-bull/components/RegisterForm";
import { Benefits } from "@/features/red-bull/components/Benefits";
import { motion } from "framer-motion";

export default function RedBullPage() {
    return (
        <main className="min-h-screen bg-[#001122]">
            {/* Hero Section */}
            <Hero />

            {/* Registration Section */}
            <section id="register" className="relative -mt-32 pb-24 px-6 z-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-left"
                    >
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-white italic mb-6">
                            Lleva tu Lísmite <br />
                            <span className="text-[#DB0A40]">Más Allá</span>
                        </h2>
                        <p className="text-lg text-white/70 max-w-lg mb-8">
                            No solo mires la acción. Sé parte de ella. Únete a la plataforma que conecta a los fans con el corazón de los deportes extremos.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 bg-white/10 border border-white/20 rounded-none flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#FFCC00]">
                                +50,000 MIEMBROS YA INSCRITOS
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <RegisterForm />
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <Benefits />

            {/* Testimonials Carousel Placeholder */}
            <section className="bg-[#001122] py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-black uppercase text-white italic mb-12 border-l-4 border-[#DB0A40] pl-4">Voces de la Élite</h2>
                    <div className="flex gap-8 animate-marquee whitespace-nowrap">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block bg-[#001E36] p-8 min-w-[300px] border border-white/10 italic">
                                <p className="text-white/80 text-lg mb-4 whitespace-normal">"Esta plataforma ha cambiado la forma en que interactúo con mis fans. Es puro ADN Red Bull."</p>
                                <p className="text-[#DB0A40] font-bold uppercase tracking-widest">- Atleta {i}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
