"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  generalSettingsSchema,
  type GeneralSettingsInput,
} from "@/modules/vertical/otica/lib/validations/dashboard";
import { updateGeneralSettingsAction } from "@/modules/vertical/otica/actions/store-settings";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { Textarea } from "@/shared/ui/components/textarea";

interface GeneralSettingsFormProps {
  storeId: string;
  defaultValues: {
    name: string;
    description: string;
    logoUrl: string;
    whatsappNumber: string;
  };
}

export function GeneralSettingsForm({
  storeId,
  defaultValues,
}: GeneralSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues,
  });

  function onSubmit(data: GeneralSettingsInput) {
    setServerError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateGeneralSettingsAction(
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
        <Label htmlFor="name">Nome da loja *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div>
        <Label htmlFor="logoUrl">URL do Logo</Label>
        <Input
          id="logoUrl"
          {...register("logoUrl")}
          placeholder="https://..."
        />
        {errors.logoUrl && (
          <p className="mt-1 text-xs text-danger">{errors.logoUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="whatsappNumber">WhatsApp</Label>
        <Input
          id="whatsappNumber"
          {...register("whatsappNumber")}
          placeholder="+5511999887766"
        />
        {errors.whatsappNumber && (
          <p className="mt-1 text-xs text-danger">
            {errors.whatsappNumber.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        {success && (
          <p className="text-sm text-green-600">Configurações salvas!</p>
        )}
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
      </div>
    </form>
  );
}
