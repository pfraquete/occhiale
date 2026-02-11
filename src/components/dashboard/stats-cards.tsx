import { DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { StatsCard } from "./stats-card";
import { formatCentsToBRL } from "@/lib/utils/format";
import type { DashboardStats } from "@/lib/supabase/queries/dashboard";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Vendas (30d)"
        value={formatCentsToBRL(stats.totalSales)}
        icon={DollarSign}
        description="Últimos 30 dias"
      />
      <StatsCard
        title="Pedidos (30d)"
        value={String(stats.totalOrders)}
        icon={ShoppingBag}
        description="Últimos 30 dias"
      />
      <StatsCard
        title="Ticket Médio"
        value={formatCentsToBRL(stats.avgTicket)}
        icon={TrendingUp}
        description="Valor médio por pedido"
      />
      <StatsCard
        title="Produtos Ativos"
        value={String(stats.activeProducts)}
        icon={Package}
        description="No catálogo"
      />
    </div>
  );
}
