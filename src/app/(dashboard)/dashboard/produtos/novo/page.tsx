import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata = {
  title: "Novo Produto — OCCHIALE",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Novo Produto
        </h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Adicione um novo produto ao catálogo da sua loja.
        </p>
      </div>

      <ProductForm storeId={membership.storeId} />
    </div>
  );
}
