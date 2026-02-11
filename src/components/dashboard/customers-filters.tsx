"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function CustomersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.delete("pagina");
    router.push(`/dashboard/clientes?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearchSubmit} className="max-w-md">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, e-mail ou telefone..."
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </form>
  );
}
