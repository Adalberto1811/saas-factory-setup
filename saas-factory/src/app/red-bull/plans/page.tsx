import { Plans } from "@/features/red-bull/components/Plans";

export const metadata = {
    title: "Selecciona tu Plan | Red Bull Experiences",
    description: "Elige el nivel de acceso que mejor se adapte a tus metas.",
};

export default function Page() {
    return (
        <main className="min-h-screen bg-[#001122]">
            {/* Background Noise/Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10">
                <Plans />
            </div>
        </main>
    );
}
