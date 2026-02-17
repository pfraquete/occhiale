import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import {
  getDailySales,
  getTopProducts,
  getPaymentMethodBreakdown,
  getOrderStatusBreakdown,
  getCustomerGrowth,
  getConversionMetrics,
} from "@/shared/lib/supabase/queries/analytics";
import { redirect } from "next/navigation";
import {
  SalesChart,
  OrdersChart,
  TopProductsChart,
  PaymentMethodsChart,
  OrderStatusChart,
  CustomerGrowthChart,
  ConversionMetrics,
} from "@/components/dashboard/analytics-charts";

export const metadata = {
  title: "Analytics — OCCHIALE",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const storeId = membership.storeId;

  const [
    dailySales,
    topProducts,
    paymentMethods,
    orderStatuses,
    customerGrowth,
    conversionData,
  ] = await Promise.all([
    getDailySales(storeId, 30),
    getTopProducts(storeId, 5),
    getPaymentMethodBreakdown(storeId),
    getOrderStatusBreakdown(storeId),
    getCustomerGrowth(storeId, 30),
    getConversionMetrics(storeId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Métricas detalhadas dos últimos 30 dias.
        </p>
      </div>

      {/* Conversion Metrics */}
      <ConversionMetrics
        totalCustomers={conversionData.totalCustomers}
        purchasingCustomers={conversionData.purchasingCustomers}
        returningCustomers={conversionData.returningCustomers}
        conversionRate={conversionData.conversionRate}
      />

      {/* Sales & Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={dailySales} />
        <OrdersChart data={dailySales} />
      </div>

      {/* Top Products & Payment Methods */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProductsChart data={topProducts} />
        <PaymentMethodsChart data={paymentMethods} />
      </div>

      {/* Order Status & Customer Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrderStatusChart data={orderStatuses} />
        <CustomerGrowthChart data={customerGrowth} />
      </div>
    </div>
  );
}
