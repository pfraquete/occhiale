"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  DailySales,
  TopProduct,
  PaymentMethodBreakdown,
  OrderStatusBreakdown,
  CustomerGrowth,
} from "@/shared/lib/supabase/queries/analytics";

// ------------------------------------------
// Color palette (dark mode friendly)
// ------------------------------------------

const COLORS = [
  "#d4a574", // gold/amber (brand)
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#6366f1",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Em preparo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  boleto: "Boleto",
  whatsapp: "WhatsApp",
  outro: "Outro",
};

// ------------------------------------------
// Formatters
// ------------------------------------------

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ------------------------------------------
// Chart Components
// ------------------------------------------

interface SalesChartProps {
  data: DailySales[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Vendas Diárias (30 dias)
      </h3>
      {data.every((d) => d.revenue === 0) ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhuma venda registrada no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a574" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4a574" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke="#71717a"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => formatBRL(v)}
              stroke="#71717a"
              fontSize={12}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                formatBRL(Number(value ?? 0)),
                "Receita",
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) =>
                new Date(String(label) + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "long",
                  }
                )
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d4a574"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface OrdersChartProps {
  data: DailySales[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Pedidos Diários (30 dias)
      </h3>
      {data.every((d) => d.orders === 0) ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhum pedido registrado no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke="#71717a"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [Number(value ?? 0), "Pedidos"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) =>
                new Date(String(label) + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "long",
                  }
                )
              }
            />
            <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface TopProductsChartProps {
  data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Top Produtos (30 dias)
      </h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhum produto vendido no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatBRL(v)}
              stroke="#71717a"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#71717a"
              fontSize={12}
              width={120}
              tickFormatter={(v: string) =>
                v.length > 18 ? v.slice(0, 18) + "…" : v
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                name === "totalRevenue"
                  ? formatBRL(Number(value ?? 0))
                  : `${Number(value ?? 0)} unidades`,
                name === "totalRevenue" ? "Receita" : "Quantidade",
              ]}
            />
            <Bar dataKey="totalRevenue" fill="#d4a574" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface PaymentMethodsChartProps {
  data: PaymentMethodBreakdown[];
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: PAYMENT_LABELS[d.method] ?? d.method,
  }));

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Métodos de Pagamento
      </h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhum dado disponível.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="count"
              nameKey="label"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${Number(value ?? 0)} pedidos`,
                String(name ?? ""),
              ]}
            />
            <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: "13px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface OrderStatusChartProps {
  data: OrderStatusBreakdown[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: STATUS_LABELS[d.status] ?? d.status,
    color: STATUS_COLORS[d.status] ?? "#71717a",
  }));

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Status dos Pedidos
      </h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhum dado disponível.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="count"
              nameKey="label"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${Number(value ?? 0)} pedidos`,
                String(name ?? ""),
              ]}
            />
            <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: "13px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface CustomerGrowthChartProps {
  data: CustomerGrowth[];
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const cumulativeData = useMemo(() => {
    const result: Array<CustomerGrowth & { total: number }> = [];
    for (let i = 0; i < data.length; i++) {
      const prev = i > 0 ? result[i - 1]!.total : 0;
      result.push({ ...data[i]!, total: prev + data[i]!.newCustomers });
    }
    return result;
  }, [data]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Crescimento de Clientes
      </h3>
      {data.every((d) => d.newCustomers === 0) ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Nenhum novo cliente no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke="#71717a"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                Number(value ?? 0),
                name === "total" ? "Total acumulado" : "Novos clientes",
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) =>
                new Date(String(label) + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "long",
                  }
                )
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#customerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ------------------------------------------
// Conversion Metrics Card
// ------------------------------------------

interface ConversionMetricsProps {
  totalCustomers: number;
  purchasingCustomers: number;
  returningCustomers: number;
  conversionRate: number;
}

export function ConversionMetrics({
  totalCustomers,
  purchasingCustomers,
  returningCustomers,
  conversionRate,
}: ConversionMetricsProps) {
  const retentionRate =
    purchasingCustomers > 0
      ? Math.round((returningCustomers / purchasingCustomers) * 100 * 10) / 10
      : 0;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">
        Conversão e Retenção
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Total Clientes"
          value={String(totalCustomers)}
          color="text-zinc-100"
        />
        <MetricCard
          label="Taxa Conversão"
          value={`${conversionRate}%`}
          subtext="Clientes → Compradores"
          color="text-amber-400"
        />
        <MetricCard
          label="Compradores"
          value={String(purchasingCustomers)}
          color="text-green-400"
        />
        <MetricCard
          label="Taxa Retenção"
          value={`${retentionRate}%`}
          subtext="Compradores recorrentes"
          color="text-indigo-400"
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-400">{label}</p>
      {subtext && <p className="text-xs text-zinc-600">{subtext}</p>}
    </div>
  );
}
