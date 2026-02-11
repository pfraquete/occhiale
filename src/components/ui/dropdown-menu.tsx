"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

/* ───────── Root ───────── */
interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      {typeof children === "object" &&
      (children as React.ReactElement[]).length !== undefined
        ? (children as React.ReactElement[]).map((child) => {
            if (!child || typeof child !== "object") return child;
            const c = child as React.ReactElement<{
              open?: boolean;
              onToggle?: () => void;
              onClose?: () => void;
            }>;
            return {
              ...c,
              props: {
                ...c.props,
                open,
                onToggle: () => setOpen(!open),
                onClose: () => setOpen(false),
              },
            };
          })
        : children}
    </div>
  );
}

/* ───────── Trigger ───────── */
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  children,
  onToggle,
  className,
}: DropdownMenuTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("outline-none", className)}
    >
      {children}
    </button>
  );
}

/* ───────── Content ───────── */
interface DropdownMenuContentProps {
  children: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  className?: string;
  align?: "start" | "end";
}

export function DropdownMenuContent({
  children,
  open,
  onClose,
  className,
  align = "end",
}: DropdownMenuContentProps) {
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-surface py-1 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {typeof children === "object" && Array.isArray(children)
        ? children.map((child) => {
            if (!child || typeof child !== "object") return child;
            const el = child as React.ReactElement<{ onClose?: () => void }>;
            return {
              ...el,
              props: { ...el.props, onClose },
            };
          })
        : children}
    </div>
  );
}

/* ───────── Item ───────── */
interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
  destructive?: boolean;
}

export function DropdownMenuItem({
  children,
  onClick,
  onClose,
  className,
  destructive,
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        onClose?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
        destructive
          ? "text-danger hover:bg-red-50"
          : "text-text-primary hover:bg-bg-secondary",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ───────── Separator ───────── */
export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} />;
}

/* ───────── Label ───────── */
export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-text-tertiary",
        className
      )}
    >
      {children}
    </div>
  );
}
