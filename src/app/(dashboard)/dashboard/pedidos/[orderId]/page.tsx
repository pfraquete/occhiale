import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getOrderById } from "@/shared/lib/supabase/queries/dashboard-orders";
import { redirect, notFound } from "next/navigation";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { OrderItemsList } from "@/components/dashboard/order-items-list";
import { OrderCustomerInfo } from "@/components/dashboard/order-customer-info";
import { UpdateOrderStatusForm } from "@/components/dashboard/update-order-status-form";
import { FiscalDetails } from "@/components/dashboard/orders/fiscal-details";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const order = await getOrderById(orderId);
  if (!order) notFound();

  // Verify order belongs to the user's store (RLS should already enforce this)
  if (order.store_id !== membership.storeId) notFound();

  const paymentMethodLabel =
    order.payment_method === "credit_card"
      ? "Cartão de Crédito"
      : order.payment_method === "pix"
        ? "PIX"
        : order.payment_method === "boleto"
          ? "Boleto"
          : order.payment_method;

  return (
    <div className="space-y-6">
      {/* Back link + order number */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/pedidos"
          className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Pedido {order.order_number}
          </h1>
          <p className="text-sm text-text-tertiary">
            {format(
              new Date(order.created_at),
              "dd 'de' MMMM 'de' yyyy, HH:mm",
              {
                locale: ptBR,
              }
            )}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Itens do Pedido
            </h3>
            <div className="mt-3">
              <OrderItemsList items={order.order_items ?? []} />
            </div>
            <div className="mt-4 flex justify-end border-t border-border pt-4">
              <div className="text-right">
                <p className="text-sm text-text-tertiary">Total</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatCentsToBRL(order.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Update status */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <UpdateOrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Fiscal Info */}
          <FiscalDetails
            orderId={order.id}
            fiscalStatus={order.fiscal_status || "none"}
            fiscalKey={order.fiscal_key || undefined}
            fiscalNumber={order.fiscal_number || undefined}
            fiscalPdfUrl={order.fiscal_pdf_url || undefined}
            fiscalXmlUrl={order.fiscal_xml_url || undefined}
          />

          {/* Customer info */}
          <OrderCustomerInfo customer={order.customers} />

          {/* Payment info */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Pagamento
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Método</span>
                <span className="text-text-primary">{paymentMethodLabel}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Status</span>
                <OrderStatusBadge
                  status={order.payment_status}
                  type="payment"
                />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">
                Endereço de Entrega
              </h3>
              <div className="mt-3 text-sm text-text-secondary">
                {typeof order.shipping_address === "object" && (
                  <>
                    <p>
                      {
                        (order.shipping_address as Record<string, string>)
                          .street
                      }
                    </p>
                    <p>
                      {
                        (order.shipping_address as Record<string, string>)
                          .neighborhood
                      }
                      {(order.shipping_address as Record<string, string>)
                        .complement &&
                        ` — ${(order.shipping_address as Record<string, string>).complement}`}
                    </p>
                    <p>
                      {(order.shipping_address as Record<string, string>).city}{" "}
                      —{" "}
                      {(order.shipping_address as Record<string, string>).state}
                    </p>
                    <p>
                      CEP:{" "}
                      {
                        (order.shipping_address as Record<string, string>)
                          .zipCode
                      }
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
