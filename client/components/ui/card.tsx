import type { HTMLAttributes, PropsWithChildren } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`p-4 border-b ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: PropsWithChildren<CardProps>) {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`p-4 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
