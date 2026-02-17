"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

interface CartIconProps {
  storeSlug: string;
}

export function CartIcon({ storeSlug }: CartIconProps) {
  const count = useCart((s) => s.itemCount());

  return (
    <Link
      href={`/${storeSlug}/carrinho`}
      className="relative inline-flex items-center justify-center rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
      aria-label={`Carrinho${count > 0 ? ` (${count} itens)` : ""}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
