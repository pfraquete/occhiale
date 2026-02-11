"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/use-cart";
import { QuantitySelector } from "./quantity-selector";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    brand: string | null;
    stock_qty: number;
  };
  storeId: string;
  storeSlug: string;
  lensConfig?: Record<string, unknown>;
}

export function AddToCartButton({
  product,
  storeId,
  storeSlug,
  lensConfig,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);

  const isOutOfStock = product.stock_qty <= 0;

  function handleAdd() {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity,
      brand: product.brand ?? undefined,
      lensConfig,
    };

    const ok = addItem(storeId, storeSlug, item);
    if (!ok) {
      // Different store — confirm clear
      if (
        window.confirm(
          "Seu carrinho contém itens de outra loja. Deseja limpar o carrinho e adicionar este item?"
        )
      ) {
        clearCart();
        addItem(storeId, storeSlug, item);
      } else {
        return;
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity}
        max={product.stock_qty}
      />

      <button
        onClick={handleAdd}
        disabled={isOutOfStock || added}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
          added
            ? "bg-green-600 text-white"
            : isOutOfStock
              ? "cursor-not-allowed bg-surface-secondary text-text-tertiary"
              : "bg-accent-500 text-white hover:bg-accent-600 active:scale-[0.98]"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Adicionado!
          </>
        ) : isOutOfStock ? (
          "Produto Esgotado"
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Adicionar ao Carrinho
          </>
        )}
      </button>
    </div>
  );
}
