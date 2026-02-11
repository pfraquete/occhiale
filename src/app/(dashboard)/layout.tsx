export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's store membership + store data
  const membership = await getUserStoreWithRole(user.id);

  if (!membership || !membership.store.is_active) {
    notFound();
  }

  const providerValue = {
    storeId: membership.storeId,
    storeName: membership.store.name,
    storeSlug: membership.store.slug,
    storeLogo: membership.store.logo_url,
    userRole: membership.role,
    userName:
      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário",
    userEmail: user.email ?? "",
  };

  return (
    <DashboardProvider value={providerValue}>
      <div className="flex min-h-screen bg-bg-primary">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
