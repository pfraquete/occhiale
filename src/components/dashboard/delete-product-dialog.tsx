"use client";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isPending: boolean;
}

export function DeleteProductDialog({
  open,
  onClose,
  onConfirm,
  productName,
  isPending,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Excluir produto</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir <strong>{productName}</strong>? Esta
          ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Excluindo..." : "Excluir"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
