import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function Button({
  children,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "rounded font-medium transition-colors";
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
}
