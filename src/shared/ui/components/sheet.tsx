"use client";

import { useEffect } from "react";
import { cn } from "@/shared/lib/utils/cn";
import { X } from "lucide-react";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
  title?: string;
}

export function Sheet({
  open,
  onClose,
  children,
  side = "left",
  className,
  title,
}: SheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
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
          "absolute top-0 bottom-0 flex w-80 flex-col bg-surface shadow-xl transition-transform duration-300",
          side === "left" ? "left-0" : "right-0",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
