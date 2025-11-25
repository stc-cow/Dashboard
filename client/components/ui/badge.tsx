import React from "react";

export function Badge({ children, className = "", variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "outline" }) {
  const baseStyles = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variantStyles = variant === "outline"
    ? "border border-gray-300 bg-white text-gray-700"
    : "bg-blue-100 text-blue-800";

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
}
