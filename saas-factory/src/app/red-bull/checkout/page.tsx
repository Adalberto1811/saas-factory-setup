import { Checkout } from "@/features/red-bull/components/Checkout";

export const metadata = {
    title: "Pago Seguro | Red Bull Experiences",
    description: "Completa tu suscripción y comienza tu aventura.",
};

export default function Page() {
    return (
        <main className="min-h-screen bg-[#001E36]">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DB0A40]/10 blur-[120px] rounded-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFCC00]/5 blur-[120px] rounded-none" />
            </div>
            <div className="relative z-10">
                <Checkout />
            </div>
        </main>
    );
}
