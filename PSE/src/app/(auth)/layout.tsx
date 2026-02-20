import { ThreeBackground } from "@/shared/components/ThreeBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-synergos-electric-blue/10 rounded-full blur-[180px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-synergos-neon-green/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Premium 3D Background Layer */}
      <ThreeBackground />

      {/* Branding Signature */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex items-center gap-4 z-50">
        <img src="/performance/pse_metallic_logo_v2.png" alt="PSE Logo" className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]" />
      </div>

      <div className="z-10 w-full flex justify-center items-center">
        {children}
      </div>

      {/* Footer info */}
      <div className="absolute bottom-8 text-center z-50 opacity-30 select-none">
        <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-[0.5em]">Secure Auth System v3.5 // Synergos</span>
      </div>
    </div>
  )
}
