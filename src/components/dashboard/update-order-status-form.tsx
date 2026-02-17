"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/modules/vertical/otica/actions/orders";
import { validStatusTransitions } from "@/modules/vertical/otica/lib/validations/dashboard";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

interface UpdateOrderStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export function UpdateOrderStatusForm({
  orderId,
  currentStatus,
}: UpdateOrderStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableTransitions = validStatusTransitions[currentStatus] ?? [];

  if (availableTransitions.length === 0) {
    return (
      <p className="text-xs text-text-tertiary">
        Nenhuma transição disponível para o status atual.
      </p>
    );
  }

  function handleUpdate(newStatus: string) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-primary">Atualizar Status</p>
      <div className="flex flex-wrap gap-2">
        {availableTransitions.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleUpdate(status)}
            disabled={isPending}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            → {statusLabels[status] ?? status}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {success && (
        <p className="text-xs text-green-600">Status atualizado com sucesso!</p>
      )}
    </div>
  );
}
