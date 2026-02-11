"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleProductActiveAction } from "@/lib/actions/products";

interface ToggleProductSwitchProps {
  productId: string;
  isActive: boolean;
}

export function ToggleProductSwitch({
  productId,
  isActive,
}: ToggleProductSwitchProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleProductActiveAction(productId, checked);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className="text-xs text-text-tertiary">
        {isActive ? "Ativo" : "Inativo"}
      </span>
    </div>
  );
}
