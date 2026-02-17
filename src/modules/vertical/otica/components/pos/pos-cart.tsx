"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { formatCentsToBRL } from "@/shared/lib/utils/format";

interface CartItem {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

interface POSCartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
}

export function POSCart({ items, onUpdateQuantity, onRemove }: POSCartProps) {
    if (items.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-xl bg-bg-secondary/30">
                <p className="text-sm text-text-tertiary">Carrinho vazio</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-text-primary line-clamp-1">{item.name}</span>
                        <span className="text-xs text-text-tertiary">{formatCentsToBRL(item.unitPrice)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-lg border border-border bg-bg-secondary">
                            <button
                                onClick={() => onUpdateQuantity(item.productId, -1)}
                                className="p-1.5 text-text-tertiary hover:text-text-primary"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item.productId, 1)}
                                className="p-1.5 text-text-tertiary hover:text-text-primary"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>

                        <span className="w-20 text-right text-sm font-semibold text-text-primary">
                            {formatCentsToBRL(item.unitPrice * item.quantity)}
                        </span>

                        <button
                            onClick={() => onRemove(item.productId)}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-md"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
