import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Package, TrendingUp, AlertTriangle, History } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { getInventoryMovements, getABCAnalysis, getExpiringBatchesCount } from "@/lib/supabase/queries/inventory";
import { getProducts } from "@/lib/supabase/queries/dashboard-products";
import { InventoryView } from "@/components/dashboard/inventory/inventory-view";
import { redirect } from "next/navigation";

export default async function InventarioPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get the first store the user has access to
    const { data: stores } = await supabase.from("stores").select("id").limit(1);
    if (!stores || stores.length === 0) {
        return (
            <div className="flex-1 p-8">
                <DashboardHeader />
                <div className="mt-8 text-center text-text-tertiary">Nenhuma loja encontrada.</div>
            </div>
        );
    }
    const storeId = stores[0]!.id;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<div className="h-24 rounded-xl bg-surface animate-pulse border border-border" />}>
                    <InventoryStats storeId={storeId} />
                </Suspense>
            </div>

            <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-text-tertiary">Carregando painel de inventário...</div>}>
                <InventoryDataWrapper storeId={storeId} />
            </Suspense>
        </div>
    );
}

async function InventoryDataWrapper({ storeId }: { storeId: string }) {
    const [movements, abc, { products }] = await Promise.all([
        getInventoryMovements(storeId, { limit: 100 }),
        getABCAnalysis(storeId),
        getProducts(storeId, { perPage: 100 })
    ]);

    const recentMovements = (movements || []).slice(0, 10);
    const topABC = (abc || []).filter(item => item.abc_class === 'A').slice(0, 5);

    return (
        <InventoryView
            storeId={storeId}
            recentMovements={recentMovements}
            topABCProducts={topABC}
            fullMovements={movements || []}
            fullABC={abc || []}
            products={products}
        />
    );
}

async function InventoryStats({ storeId }: { storeId: string }) {
    const [{ products, total: totalProducts }, expiringCount, movements] = await Promise.all([
        getProducts(storeId, { perPage: 1000 }),
        getExpiringBatchesCount(storeId, 30),
        getInventoryMovements(storeId, { limit: 100 })
    ]);

    const lowStock = products.filter(p => (p.stock_qty || 0) <= 5).length;

    const monthlyEntry = (movements || [])
        .filter(m => m.type === 'entry' && new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((acc, m) => acc + Math.abs(m.quantity), 0);

    return (
        <>
            <StatsCard
                title="Total de SKUs"
                value={totalProducts.toString()}
                icon={Package}
                description="Produtos cadastrados"
            />
            <StatsCard
                title="Estoque Baixo"
                value={lowStock.toString()}
                icon={AlertTriangle}
                description="Produtos < 5 unidades"
            />
            <StatsCard
                title="Entradas (30d)"
                value={monthlyEntry.toString()}
                icon={TrendingUp}
                description="Unidades recebidas"
            />
            <StatsCard
                title="Vencimentos"
                value={expiringCount.toString()}
                icon={History}
                description="Vencendo em 30 dias"
            />
        </>
    );
}
