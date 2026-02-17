import { cn } from "@/shared/lib/utils/cn";
import { Check, Clock, Package, Truck, MapPin, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TimelineStep {
  key: string;
  label: string;
  icon: LucideIcon;
}

const steps: TimelineStep[] = [
  { key: "pending", label: "Criado", icon: Clock },
  { key: "confirmed", label: "Confirmado", icon: Check },
  { key: "processing", label: "Processando", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregue", icon: MapPin },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

interface OrderTimelineProps {
  status: string;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <X className="h-4 w-4" />
        Pedido cancelado
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <X className="h-4 w-4" />
        Pagamento falhou
      </div>
    );
  }

  const currentIndex = statusIndex[status] ?? 0;

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isCompleted
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border bg-surface text-text-tertiary",
                  isCurrent && "ring-2 ring-brand-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[10px] font-medium",
                  isCompleted ? "text-brand-700" : "text-text-tertiary"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 w-8 sm:w-12",
                  i < currentIndex ? "bg-brand-600" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
