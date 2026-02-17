import { cn } from "@/shared/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-tertiary">{title}</p>
        <div className="rounded-lg bg-brand-50 p-2">
          <Icon className="h-4 w-4 text-brand-700" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-text-tertiary">{description}</p>
      )}
    </div>
  );
}
