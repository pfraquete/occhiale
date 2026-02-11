import Link from "next/link";
import Image from "next/image";
import { formatCentsToBRL } from "@/lib/utils/format";
import { getCategoryLabel, type DbCategory } from "@/lib/utils/categories";
import type { Tables } from "@/lib/types/database";

interface ProductCardProps {
  product: Tables<"products">;
  storeSlug: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;

  return (
    <Link
      href={`/${storeSlug}/produto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-secondary">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            <span className="text-4xl">👓</span>
          </div>
        )}

        {/* Brand badge */}
        {product.brand && (
          <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-text-secondary backdrop-blur-sm">
            {product.brand}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {Math.round(
              ((product.compare_price! - product.price) /
                product.compare_price!) *
                100
            )}
            % OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
          {getCategoryLabel(product.category as DbCategory)}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-text-primary group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          {hasDiscount && (
            <span className="text-xs text-text-tertiary line-through">
              {formatCentsToBRL(product.compare_price!)}
            </span>
          )}
          <p className="text-base font-bold text-brand-700">
            {formatCentsToBRL(product.price)}
          </p>
          <p className="text-[10px] text-text-tertiary">
            ou 12x de {formatCentsToBRL(Math.ceil(product.price / 12))}
          </p>
        </div>
      </div>
    </Link>
  );
}
