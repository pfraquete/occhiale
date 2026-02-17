"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import { formatCentsToBRL } from "@/shared/lib/utils/format";

interface Product {
    id: string;
    name: string;
    price: number;
    sku: string | null;
    stock_qty: number;
    category: string;
}

interface ProductSearchProps {
    onSelect: (product: Product) => void;
    products: Product[];
}

export function ProductSearch({ onSelect, products }: ProductSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.sku?.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered.slice(0, 8));
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, products]);

    // Handle barcode scanner (usually they just type fast and hit Enter)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && results.length === 1) {
            const product = results[0];
            if (product) {
                onSelect(product);
                setQuery("");
            }
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                    type="text"
                    placeholder="Buscar produto por nome ou SKU (EAN)..."
                    className="w-full rounded-lg border border-border bg-bg-secondary py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
                    <ul className="max-h-60 overflow-y-auto py-1">
                        {results.map((product) => (
                            <li key={product.id}>
                                <button
                                    onClick={() => {
                                        onSelect(product);
                                        setQuery("");
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-bg-secondary"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text-primary">{product.name}</span>
                                        <span className="text-xs text-text-tertiary">{product.sku || "Sem SKU"} • {product.category}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-brand-600">
                                            {formatCentsToBRL(product.price)}
                                        </span>
                                        <div className="rounded bg-bg-tertiary p-1">
                                            <Plus className="h-3 w-3" />
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
