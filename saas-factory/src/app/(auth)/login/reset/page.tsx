import { ResetForm } from '@/features/auth/components/ResetForm';

export default function ResetPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
            <div className="relative z-10 w-full max-w-md px-4">
                <ResetForm />
            </div>
        </div>
    )
}
