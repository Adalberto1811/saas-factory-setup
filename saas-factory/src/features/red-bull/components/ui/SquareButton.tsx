import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface SquareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
}

export function SquareButton({
    children,
    variant = "primary",
    size = "md",
    className,
    ...props
}: SquareButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none border-2";

    const variants = {
        primary: "bg-[#DB0A40] text-white border-[#DB0A40] hover:bg-white hover:text-[#DB0A40]",
        secondary: "bg-[#001E36] text-white border-[#001E36] hover:bg-white hover:text-[#001E36]",
        outline: "bg-transparent text-white border-white hover:bg-white hover:text-black",
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-8 py-3 text-sm",
        lg: "px-12 py-4 text-base",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], "rounded-none", className)}
            {...props}
        >
            {children}
        </button>
    );
}
