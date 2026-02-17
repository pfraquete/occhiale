"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/modules/core/produtos/actions/products";
import { DeleteProductDialog } from "./delete-product-dialog";

interface ProductActionsDropdownProps {
  productId: string;
  productName: string;
}

export function ProductActionsDropdown({
  productId,
  productName,
}: ProductActionsDropdownProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteProductAction(productId);
      setShowDelete(false);
    });
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-md">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/dashboard/produtos/${productId}`);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setShowDelete(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          </>
        )}
      </div>

      <DeleteProductDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        productName={productName}
        isPending={isPending}
      />
    </>
  );
}
