import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { getServiceOrders } from "@/lib/supabase/queries/service-orders";
import { redirect } from "next/navigation";
import { OSTable } from "@/components/dashboard/os-table";

export const metadata = {
    title: "Ordens de Serviço — OCCHIALE",
};

export default async function ServiceOrdersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await getUserStoreWithRole(user.id);
    if (!membership) redirect("/login");

    const serviceOrders = await getServiceOrders(membership.storeId);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-text-primary">Ordens de Serviço</h1>
                <p className="mt-1 text-sm text-text-tertiary">
                    Gerencie o fluxo de laboratório e produção dos óculos.
                </p>
            </div>

            <OSTable serviceOrders={serviceOrders} />
        </div>
    );
}
