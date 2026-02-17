"use client";

import { useState, useTransition } from "react";
import { updateOSStatusAction } from "@/modules/vertical/otica/actions/service-order";

const statusTransitions: Record<string, string[]> = {
    lab_pending: ["waiting_material", "surfacing", "cancelled"],
    waiting_material: ["surfacing", "cancelled"],
    surfacing: ["mounting", "cancelled"],
    mounting: ["quality_control", "cancelled"],
    quality_control: ["ready_for_pickup", "mounting", "cancelled"],
    ready_for_pickup: ["delivered", "cancelled"],
    delivered: [],
    cancelled: ["lab_pending"],
};

const statusLabels: Record<string, string> = {
    lab_pending: "Pendente",
    waiting_material: "Aguardando Mat.",
    surfacing: "Surfaçagem",
    mounting: "Montagem",
    quality_control: "Conferência",
    ready_for_pickup: "Pronto p/ Retirada",
    delivered: "Entregue",
    cancelled: "Cancelado",
};

interface UpdateOSStatusFormProps {
    osId: string;
    currentStatus: string;
}

export function UpdateOSStatusForm({
    osId,
    currentStatus,
}: UpdateOSStatusFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const availableTransitions = statusTransitions[currentStatus] ?? [];

    function handleUpdate(newStatus: string) {
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateOSStatusAction(osId, newStatus as any);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        });
    }

    if (availableTransitions.length === 0 && currentStatus === "delivered") {
        return <p className="text-sm text-text-tertiary">Pedido entregue ao cliente.</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {availableTransitions.map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => handleUpdate(status)}
                        disabled={isPending}
                        className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                    >
                        → {statusLabels[status] ?? status}
                    </button>
                ))}
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            {success && (
                <p className="text-xs text-green-600">Status da OS atualizado com sucesso!</p>
            )}
        </div>
    );
}
