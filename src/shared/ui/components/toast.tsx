"use client";

import { useCallback, useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils/cn";
import { X } from "lucide-react";

// ============================================================================
// Toast Component & Hook
// ============================================================================

const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-text-primary",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
        error:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-xs opacity-80">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ============================================================================
// useToast Hook
// ============================================================================

let toastCounter = 0;
const listeners = new Set<(toasts: ToastData[]) => void>();
let memoryToasts: ToastData[] = [];

function dispatch(toasts: ToastData[]) {
  memoryToasts = toasts;
  listeners.forEach((listener) => listener(toasts));
}

export function toast(params: Omit<ToastData, "id">) {
  const id = `toast-${++toastCounter}`;
  const newToast: ToastData = { ...params, id };
  const duration = params.duration ?? 5000;

  dispatch([...memoryToasts, newToast]);

  if (duration > 0) {
    setTimeout(() => {
      dispatch(memoryToasts.filter((t) => t.id !== id));
    }, duration);
  }

  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>(memoryToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch(memoryToasts.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
