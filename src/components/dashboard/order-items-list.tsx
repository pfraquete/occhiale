import { formatCentsToBRL } from "@/lib/utils/format";
import type { Json } from "@/lib/types/database";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  lens_config: Json;
  products: {
    id: string;
    name: string;
    images: string[] | null;
    brand: string | null;
  } | null;
}

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 py-3">
          {/* Image placeholder */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-secondary">
            {item.products?.images?.[0] ? (
              <img
                src={item.products.images[0]}
                alt={item.products.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-text-tertiary">
                Sem img
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {item.products?.name ?? "Produto removido"}
            </p>
            <p className="text-xs text-text-tertiary">
              {item.products?.brand ?? "—"} · Qtd: {item.quantity}
            </p>
            {item.lens_config &&
              typeof item.lens_config === "object" &&
              !Array.isArray(item.lens_config) &&
              Object.keys(item.lens_config).length > 0 && (
                <p className="mt-0.5 text-xs text-brand-600">
                  + Configuração de lente
                </p>
              )}
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">
              {formatCentsToBRL(item.unit_price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-text-tertiary">
                {formatCentsToBRL(item.unit_price)} cada
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
