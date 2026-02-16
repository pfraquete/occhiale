"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createBatchAction, addMovementAction } from "@/lib/actions/inventory";

interface AddBatchDialogProps {
    storeId: string;
    productId: string;
}

export function AddBatchDialog({ storeId, productId }: AddBatchDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const batchNumber = formData.get("batchNumber") as string;
        const quantity = parseInt(formData.get("quantity") as string);
        const cost = parseFloat(formData.get("cost") as string);
        const expiryDate = formData.get("expiryDate") as string;

        try {
            const batch = await createBatchAction({
                store_id: storeId,
                product_id: productId,
                batch_number: batchNumber,
                initial_qty: quantity,
                current_qty: quantity,
                entry_cost: Math.round(cost * 100),
                expiry_date: expiryDate || null,
            });

            await addMovementAction({
                store_id: storeId,
                product_id: productId,
                batch_id: batch.id,
                type: "entry",
                quantity: quantity,
                reason: `Nova entrada de lote: ${batchNumber}`,
            });

            setOpen(false);
            router.refresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erro ao adicionar lote.";
            setError(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Lote
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogClose onClose={() => setOpen(false)} />
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Lote</DialogTitle>
                        <DialogDescription>
                            Insira os detalhes do lote para rastreamento de validade e custo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="batchNumber">Número do Lote</Label>
                            <Input id="batchNumber" name="batchNumber" placeholder="Ex: LOTE-2024-001" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantidade</Label>
                                <Input id="quantity" name="quantity" type="number" defaultValue="1" min="1" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Custo Unitário (R$)</Label>
                                <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Data de Validade (opcional)</Label>
                            <Input id="expiryDate" name="expiryDate" type="date" />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-danger">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Lote"}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </>
    );
}
