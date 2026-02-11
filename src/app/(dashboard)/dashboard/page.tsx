import { createClient } from "@/lib/supabase/server";
import {
  getUserStoreWithRole,
  getDashboardStats,
  getRecentOrders,
} from "@/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";

export const metadata = {
  title: "Dashboard — OCCHIALE",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(membership.storeId),
    getRecentOrders(membership.storeId),
  ]);

  const hasOrders = stats.totalOrders > 0 || recentOrders.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Visão Geral
        </h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Resumo dos últimos 30 dias da sua loja.
        </p>
      </div>

      <StatsCards stats={stats} />

      {hasOrders ? (
        <RecentOrdersTable orders={recentOrders} />
      ) : (
        <EmptyDashboard />
      )}

      <QuickActions />
    </div>
  );
}
