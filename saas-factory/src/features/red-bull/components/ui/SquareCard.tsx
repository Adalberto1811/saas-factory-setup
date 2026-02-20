import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface SquareCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function SquareCard({ children, className, onClick }: SquareCardProps) {
    return (
        <div
            className={cn(
                "bg-[#001E36]/80 backdrop-blur-xl border border-white/10 p-6 rounded-none glass-premium",
                className
            )}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
