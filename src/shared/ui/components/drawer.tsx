"use client";

import { useEffect } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { X } from "lucide-react";

// ============================================================================
// Drawer Component (Slide-out panel)
// ============================================================================

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute top-0 h-full w-full max-w-md border-border bg-surface shadow-xl transition-transform",
          side === "right"
            ? "right-0 border-l"
            : "left-0 border-r",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DrawerTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-semibold text-text-primary", className)}>
      {children}
    </h2>
  );
}

export function DrawerClose({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "rounded-md p-1 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary",
        className
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export function DrawerContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}
