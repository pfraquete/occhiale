import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import {
  getCustomerById,
  getCustomerOrders,
  getCustomerPrescriptions,
} from "@/lib/supabase/queries/dashboard-customers";
import { redirect, notFound } from "next/navigation";
import { formatCentsToBRL, formatPhone } from "@/lib/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { customerId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const customer = await getCustomerById(customerId);
  if (!customer) notFound();

  // Verify customer belongs to store (RLS enforces)
  if (customer.store_id !== membership.storeId) notFound();

  const [orders, prescriptions] = await Promise.all([
    getCustomerOrders(customerId),
    getCustomerPrescriptions(customerId),
  ]);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clientes"
          className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">
          {customer.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer info card */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-primary">
            Dados Pessoais
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <User className="h-4 w-4 text-text-tertiary" />
              {customer.name}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Mail className="h-4 w-4 text-text-tertiary" />
              {customer.email}
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone className="h-4 w-4 text-text-tertiary" />
                {formatPhone(customer.phone)}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              Cliente desde{" "}
              {format(new Date(customer.created_at), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text-primary">
              Pedidos ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-text-tertiary">
                Nenhum pedido realizado.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <Link
                        href={`/dashboard/pedidos/${order.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-text-tertiary">
                        {format(new Date(order.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-sm font-medium text-text-primary">
                        {formatCentsToBRL(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions placeholder */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text-primary">
              Receitas ({prescriptions.length})
            </h2>
            {prescriptions.length === 0 ? (
              <p className="mt-3 text-sm text-text-tertiary">
                Nenhuma receita cadastrada. Receitas serão disponíveis na Etapa
                4 (WhatsApp + IA).
              </p>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="py-3">
                    <p className="text-sm text-text-primary">
                      Receita de{" "}
                      {rx.prescription_date
                        ? format(new Date(rx.prescription_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : format(new Date(rx.created_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {rx.doctor_name
                        ? `Dr. ${rx.doctor_name}`
                        : "Médico não informado"}
                      {rx.doctor_crm ? ` — CRM: ${rx.doctor_crm}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
