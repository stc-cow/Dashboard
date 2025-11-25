import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "default" | "outline" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-slate-300 text-slate-800 bg-white hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
};

export function Button({
  className = "",
  variant = "default",
  children,
  type = "button",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
