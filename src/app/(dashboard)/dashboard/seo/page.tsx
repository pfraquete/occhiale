import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { SeoDashboard } from "./seo-dashboard";

export const metadata = {
  title: "Páginas SEO — OCCHIALE",
};

export default async function SeoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const { data: pages } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("store_id", membership.storeId)
    .order("created_at", { ascending: false });

  return (
    <SeoDashboard
      storeId={membership.storeId}
      storeSlug={membership.store.slug}
      initialPages={
        (pages ?? []) as unknown as import("@/modules/vertical/otica/actions/seo-pages").SeoPage[]
      }
    />
  );
}
