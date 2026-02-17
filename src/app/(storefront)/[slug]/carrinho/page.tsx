"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/modules/vertical/otica/components/storefront/store-provider";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { QuantitySelector } from "@/modules/vertical/otica/components/storefront/quantity-selector";

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const storeSlug = useCart((s) => s.storeSlug);
  const subtotal = useCart((s) => s.subtotal());
  const { settings } = useStore();

  const shippingCost = settings.shipping?.defaultCost ?? 0;
  const freeAbove = settings.shipping?.freeAbove ?? 0;
  const isFreeShipping = freeAbove > 0 && subtotal >= freeAbove;
  const shipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-text-tertiary/40" />
        <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
          Carrinho vazio
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Adicione produtos ao seu carrinho para continuar.
        </p>
        <Link
          href={storeSlug ? `/${storeSlug}/catalogo` : "/"}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Carrinho
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-surface p-4"
            >
              {/* Image */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">
                    👓
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    {item.brand && (
                      <span className="text-xs text-text-tertiary">
                        {item.brand}
                      </span>
                    )}
                    <h3 className="text-sm font-medium text-text-primary">
                      {item.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="rounded p-1 text-text-tertiary hover:bg-red-50 hover:text-red-600"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(qty) => updateQuantity(item.productId, qty)}
                  />
                  <p className="text-sm font-bold text-text-primary">
                    {formatCentsToBRL(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs text-text-tertiary hover:text-red-600"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Resumo</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="font-medium text-text-primary">
                {formatCentsToBRL(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Frete</dt>
              <dd className="font-medium text-text-primary">
                {isFreeShipping ? (
                  <span className="text-green-600">Grátis</span>
                ) : shipping > 0 ? (
                  formatCentsToBRL(shipping)
                ) : (
                  "A calcular"
                )}
              </dd>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between">
                <dt className="font-semibold text-text-primary">Total</dt>
                <dd className="text-lg font-bold text-brand-700">
                  {formatCentsToBRL(total)}
                </dd>
              </div>
            </div>
          </dl>

          {freeAbove > 0 && !isFreeShipping && (
            <p className="mt-3 text-xs text-text-tertiary">
              Frete grátis acima de {formatCentsToBRL(freeAbove)}
            </p>
          )}

          <Link
            href={`/${storeSlug}/checkout`}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Finalizar Compra
          </Link>

          <Link
            href={`/${storeSlug}/catalogo`}
            className="mt-2 flex w-full items-center justify-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
