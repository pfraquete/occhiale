import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getOrders } from "@/shared/lib/supabase/queries/dashboard-orders";
import { redirect } from "next/navigation";
import { OrdersFilters } from "@/components/dashboard/orders-filters";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { Suspense } from "react";

export const metadata = {
  title: "Pedidos — OCCHIALE",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const page = Number(params.pagina) || 1;
  const perPage = 20;

  const { orders, total } = await getOrders(membership.storeId, {
    status: params.status,
    dateFrom: params.de,
    dateTo: params.ate,
    search: params.q,
    page,
    perPage,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Pedidos</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Gerencie os pedidos da sua loja.
        </p>
      </div>

      <Suspense fallback={null}>
        <OrdersFilters />
      </Suspense>

      <OrdersTable
        orders={orders}
        total={total}
        page={page}
        perPage={perPage}
      />
    </div>
  );
}
