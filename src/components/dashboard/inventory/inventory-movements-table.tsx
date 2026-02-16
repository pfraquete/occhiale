"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, AlertCircle } from "lucide-react";

import { InventoryMovement } from "@/lib/types/inventory";

interface InventoryMovementsTableProps {
    movements: (InventoryMovement & {
        products: { name: string; sku: string | null } | null;
        inventory_batches: { batch_number: string | null } | null;
    })[];
    variant?: "default" | "compact";
}

const typeConfig = {
    entry: { label: "Entrada", color: "text-green-600", icon: ArrowUpCircle },
    sale: { label: "Venda", color: "text-blue-600", icon: ArrowDownCircle },
    return: { label: "Devolução", color: "text-purple-600", icon: RefreshCcw },
    adjustment: { label: "Ajuste", color: "text-orange-600", icon: AlertCircle },
    transfer: { label: "Transferência", color: "text-gray-600", icon: AlertCircle },
    loss: { label: "Perda", color: "text-red-600", icon: AlertCircle },
};

export function InventoryMovementsTable({ movements, variant = "default" }: InventoryMovementsTableProps) {
    if (!movements || movements.length === 0) {
        return <div className="text-center py-4 text-text-tertiary text-sm">Nenhuma movimentação encontrada.</div>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-bg-secondary">
                        <th className="px-4 py-3 font-semibold text-text-primary">Data</th>
                        <th className="px-4 py-3 font-semibold text-text-primary">Tipo</th>
                        <th className="px-4 py-3 font-semibold text-text-primary">Produto</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">Qtd</th>
                        {variant === "default" && (
                            <>
                                <th className="px-4 py-3 font-semibold text-text-primary">Lote</th>
                                <th className="px-4 py-3 font-semibold text-text-primary">Motivo</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {movements.map((movement) => {
                        const config = typeConfig[movement.type as keyof typeof typeConfig] || typeConfig.adjustment;
                        return (
                            <tr key={movement.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary">
                                <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                                    {format(new Date(movement.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                </td>
                                <td className="px-4 py-3">
                                    <div className={`flex items-center gap-2 ${config.color}`}>
                                        <config.icon className="h-4 w-4" />
                                        <span>{config.label}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text-primary">{movement.products?.name}</span>
                                        <span className="text-xs text-text-tertiary">{movement.products?.sku}</span>
                                    </div>
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                </td>
                                {variant === "default" && (
                                    <>
                                        <td className="px-4 py-3 text-text-secondary">{movement.inventory_batches?.batch_number ?? "-"}</td>
                                        <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{movement.reason ?? "-"}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
