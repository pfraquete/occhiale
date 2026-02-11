"use client";

import { cn } from "@/lib/utils/cn";

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ children, className }: TabsProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  activeValue?: string;
  onClick?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({
  value,
  activeValue,
  onClick,
  children,
  className,
}: TabsTriggerProps) {
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      onClick={() => onClick?.(value)}
      className={cn(
        "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "border-brand-600 text-brand-600"
          : "border-transparent text-text-secondary hover:text-text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  activeValue?: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({
  value,
  activeValue,
  children,
  className,
}: TabsContentProps) {
  if (activeValue !== value) return null;
  return <div className={cn("pt-4", className)}>{children}</div>;
}
