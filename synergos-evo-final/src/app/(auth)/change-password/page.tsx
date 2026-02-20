import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';

export default function ChangePasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[url('/grid-pattern.svg')] bg-cover relative overflow-hidden">
            {/* Dynamic background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="relative z-10 w-full max-w-md">
                <ChangePasswordForm />
            </div>
        </div>
    );
}
