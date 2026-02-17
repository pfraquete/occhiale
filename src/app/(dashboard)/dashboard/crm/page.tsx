import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { CrmDashboard } from "./crm-dashboard";

export const metadata = {
  title: "Automações CRM — OCCHIALE",
};

export default async function CrmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const { data: automations } = await supabase
    .from("crm_automations")
    .select("*")
    .eq("store_id", membership.storeId)
    .order("created_at", { ascending: false });

  return (
    <CrmDashboard
      storeId={membership.storeId}
      initialAutomations={automations ?? []}
    />
  );
}
