"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCentsToBRL } from "@/lib/utils/format";
import { OrderStatusBadge } from "./order-status-badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  customer_id: string;
  customers: { name: string; email: string | null } | null;
}

interface OrdersTableProps {
  orders: Order[];
  total: number;
  page: number;
  perPage: number;
}

export function OrdersTable({
  orders,
  total,
  page,
  perPage,
}: OrdersTableProps) {
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
    router.push(`/dashboard/pedidos?${params.toString()}`);
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12 text-center">
        <p className="text-sm text-text-tertiary">
          Nenhum pedido encontrado com os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
              <th className="px-5 py-3">Pedido</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Pagamento</th>
              <th className="px-5 py-3">Método</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-bg-secondary/50">
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/pedidos/${order.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-text-primary">
                    {order.customers?.name ?? "—"}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3">
                  <OrderStatusBadge
                    status={order.payment_status}
                    type="payment"
                  />
                </td>
                <td className="px-5 py-3 text-sm text-text-secondary capitalize">
                  {order.payment_method === "credit_card"
                    ? "Cartão"
                    : order.payment_method === "pix"
                      ? "PIX"
                      : order.payment_method === "boleto"
                        ? "Boleto"
                        : order.payment_method}
                </td>
                <td className="px-5 py-3 text-right text-sm font-medium text-text-primary">
                  {formatCentsToBRL(order.total)}
                </td>
                <td className="px-5 py-3 text-sm text-text-tertiary">
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-text-tertiary">
            Mostrando {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, total)} de {total} pedidos
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
