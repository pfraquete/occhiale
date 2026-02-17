import Link from "next/link";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { OrderStatusBadge } from "./order-status-badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentOrder {
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

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-text-primary">
          Pedidos Recentes
        </h2>
        <Link
          href="/dashboard/pedidos"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Ver todos →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
              <th className="px-5 py-3">Pedido</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Pagamento</th>
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
                  <p className="text-xs text-text-tertiary">
                    {order.customers?.email ?? "—"}
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
                <td className="px-5 py-3 text-right text-sm font-medium text-text-primary">
                  {formatCentsToBRL(order.total)}
                </td>
                <td className="px-5 py-3 text-sm text-text-tertiary">
                  {format(new Date(order.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
