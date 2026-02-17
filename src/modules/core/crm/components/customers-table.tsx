"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface CustomersTableProps {
  customers: Customer[];
  total: number;
  page: number;
  perPage: number;
}

export function CustomersTable({
  customers,
  total,
  page,
  perPage,
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("pagina", String(newPage));
    } else {
      params.delete("pagina");
    }
    router.push(`/dashboard/clientes?${params.toString()}`);
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12 text-center">
        <p className="text-sm text-text-tertiary">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Telefone</th>
              <th className="px-5 py-3">Cliente desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-bg-secondary/50">
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/clientes/${customer.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-sm text-text-secondary">
                  {customer.email ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm text-text-secondary">
                  {customer.phone ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm text-text-tertiary">
                  {format(new Date(customer.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-text-tertiary">
            Mostrando {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, total)} de {total} clientes
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
