"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-surface-secondary disabled:opacity-30"
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm font-medium text-text-primary">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-surface-secondary disabled:opacity-30"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
