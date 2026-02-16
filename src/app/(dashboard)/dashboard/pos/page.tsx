import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { POSContainer } from "@/components/dashboard/pos/pos-container";

export default async function POSPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const membership = await getUserStoreWithRole(user.id);
    if (!membership) redirect("/login");

    // Fetch all products for fast search
    const { data: products } = await supabase
        .from("products")
        .select("id, name, price, sku, stock_qty, category")
        .eq("store_id", membership.storeId)
        .eq("is_active", true);

    // Fetch recent customers
    const { data: customers } = await supabase
        .from("customers")
        .select("id, name, email, phone, cpf")
        .eq("store_id", membership.storeId)
        .limit(100);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Frente de Caixa (PDV)</h1>
                    <p className="text-sm text-text-tertiary">Venda rápida no balcão</p>
                </div>
            </div>

            <POSContainer
                storeId={membership.storeId}
                initialProducts={products || []}
                initialCustomers={customers || []}
            />
        </div>
    );
}
