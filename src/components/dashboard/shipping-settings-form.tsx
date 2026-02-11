"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  shippingSettingsSchema,
  type ShippingSettingsInput,
} from "@/lib/validations/dashboard";
import { updateShippingSettingsAction } from "@/lib/actions/store-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShippingSettingsFormProps {
  storeId: string;
  defaultValues: {
    defaultCost: number;
    freeAbove?: number;
  };
}

export function ShippingSettingsForm({
  storeId,
  defaultValues,
}: ShippingSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingSettingsInput>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues,
  });

  function onSubmit(data: ShippingSettingsInput) {
    setServerError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateShippingSettingsAction(
        storeId,
        data as unknown as Record<string, unknown>
      );
      if (!result.success) {
        setServerError(result.error ?? "Erro desconhecido");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="defaultCost">Custo padrão de frete (centavos)</Label>
        <Input
          id="defaultCost"
          type="number"
          {...register("defaultCost", { valueAsNumber: true })}
          placeholder="1500"
        />
        <p className="mt-1 text-xs text-text-tertiary">Ex: 1500 = R$ 15,00</p>
        {errors.defaultCost && (
          <p className="mt-1 text-xs text-danger">
            {errors.defaultCost.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="freeAbove">Frete grátis acima de (centavos)</Label>
        <Input
          id="freeAbove"
          type="number"
          {...register("freeAbove", { valueAsNumber: true })}
          placeholder="20000"
        />
        <p className="mt-1 text-xs text-text-tertiary">
          Ex: 20000 = R$ 200,00. Deixe vazio para não oferecer frete grátis.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        {success && (
          <p className="text-sm text-green-600">
            Configurações de frete salvas!
          </p>
        )}
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
      </div>
    </form>
  );
}
