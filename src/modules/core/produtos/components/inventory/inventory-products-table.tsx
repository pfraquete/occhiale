"use client";

import { Badge } from "@/shared/ui/components/badge";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { AddBatchDialog } from "./add-batch-dialog";

import { Database } from "@/shared/types/database";

type Product = Pick<Database["public"]["Tables"]["products"]["Row"], "id" | "name" | "brand" | "category" | "price" | "compare_price" | "stock_qty" | "is_active" | "images" | "created_at" | "sku">;

interface InventoryProductsTableProps {
    products: Product[];
    storeId: string;
}

export function InventoryProductsTable({ products, storeId }: InventoryProductsTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-bg-secondary">
                        <th className="px-4 py-3 font-semibold text-text-primary">Produto</th>
                        <th className="px-4 py-3 font-semibold text-text-primary">SKU</th>
                        <th className="px-4 py-3 font-semibold text-text-primary">Categoria</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">Estoque Total</th>
                        <th className="px-4 py-3 text-right font-semibold text-text-primary">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary">
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="font-medium text-text-primary">{product.name}</span>
                                    <span className="text-xs text-text-tertiary">{product.brand}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-text-secondary">{product.sku ?? "-"}</td>
                            <td className="px-4 py-3 text-text-secondary capitalize">{product.category.replace("-", " ")}</td>
                            <td className="px-4 py-3 text-right">
                                <Badge variant="outline" className={product.stock_qty <= 5 ? "bg-red-50 text-red-700 border-red-200" : ""}>
                                    {product.stock_qty} unid.
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <AddBatchDialog storeId={storeId} productId={product.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
