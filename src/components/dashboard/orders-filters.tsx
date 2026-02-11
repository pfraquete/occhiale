"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "processing", label: "Processando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("pagina");
      router.push(`/dashboard/pedidos?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters("q", search);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número do pedido..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </form>

      {/* Status filter */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateFilters("status", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={searchParams.get("de") ?? ""}
        onChange={(e) => updateFilters("de", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      {/* Date to */}
      <input
        type="date"
        value={searchParams.get("ate") ?? ""}
        onChange={(e) => updateFilters("ate", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
