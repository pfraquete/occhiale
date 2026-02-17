import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getCustomers } from "@/shared/lib/supabase/queries/dashboard-customers";
import { redirect } from "next/navigation";
import { CustomersFilters } from "@/modules/core/crm/components/customers-filters";
import { CustomersTable } from "@/modules/core/crm/components/customers-table";
import { Suspense } from "react";

export const metadata = {
  title: "Clientes — OCCHIALE",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
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

  const { customers, total } = await getCustomers(membership.storeId, {
    search: params.q,
    page,
    perPage,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Clientes</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Visualize os clientes da sua loja.
        </p>
      </div>

      <Suspense fallback={null}>
        <CustomersFilters />
      </Suspense>

      <Suspense fallback={null}>
        <CustomersTable
          customers={customers}
          total={total}
          page={page}
          perPage={perPage}
        />
      </Suspense>
    </div>
  );
}
