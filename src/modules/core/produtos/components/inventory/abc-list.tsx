"use client";

import { Badge } from "@/shared/ui/components/badge";
import { formatCentsToBRL } from "@/shared/lib/utils/format";

import { ABCAnalysis } from "@/shared/types/inventory";

interface ABCListProps {
    items: ABCAnalysis[];
    showDetails?: boolean;
}

const abcConfig = {
    A: { label: "Classe A", color: "bg-green-100 text-green-800 border-green-200", description: "Top 70% receita" },
    B: { label: "Classe B", color: "bg-blue-100 text-blue-800 border-blue-200", description: "Próximos 20% receita" },
    C: { label: "Classe C", color: "bg-orange-100 text-orange-800 border-orange-200", description: "Últimos 10% receita" },
};

export function ABCList({ items, showDetails = false }: ABCListProps) {
    if (!items || items.length === 0) {
        return <div className="text-center py-4 text-text-tertiary text-sm">Dados insuficientes para análise ABC.</div>;
    }

    if (!showDetails) {
        return (
            <div className="space-y-4">
                {items.map((item) => {
                    const config = abcConfig[item.abc_class as keyof typeof abcConfig] || abcConfig["C"];
                    return (
                        <div key={item.product_id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                            <div className="flex flex-col min-w-0 flex-1 mr-4">
                                <span className="font-medium text-sm text-text-primary truncate">{item.name}</span>
                                <span className="text-xs text-text-tertiary truncate">{item.brand}</span>
                            </div>
                            <div className="flex items-center gap-3 whitespace-nowrap">
                                <span className="text-sm font-semibold text-text-primary">{formatCentsToBRL(item.total_revenue ?? 0)}</span>
                                <Badge variant="outline" className={config.color}>{item.abc_class}</Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-bg-secondary">
                        <th className="px-4 py-3 font-semibold text-text-primary">Classe</th>
                        <th className="px-4 py-3 font-semibold text-text-primary">Produto</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">Vendas (Qtd)</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">Receita Total</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">% Acumulada</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const config = abcConfig[item.abc_class as keyof typeof abcConfig] || abcConfig["C"];
                        return (
                            <tr key={item.product_id} className="border-b border-border last:border-0 hover:bg-bg-tertiary">
                                <td className="px-4 py-3">
                                    <Badge variant="outline" className={config.color}>{config.label}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text-primary">{item.name}</span>
                                        <span className="text-xs text-text-tertiary">{item.category} | {item.brand}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-text-secondary">{item.total_units_sold}</td>
                                <td className="px-4 py-3 text-right font-semibold text-text-primary">{formatCentsToBRL(item.total_revenue ?? 0)}</td>
                                <td className="px-4 py-3 text-right text-text-secondary">{item.cumulative_percentage?.toFixed(1) ?? "0.0"}%</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
