import type { HTMLAttributes, PropsWithChildren } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className = "", children, ...props }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
