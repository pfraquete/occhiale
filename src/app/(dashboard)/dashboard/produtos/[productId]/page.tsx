import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getProductById } from "@/shared/lib/supabase/queries/dashboard-products";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/modules/core/produtos/components/product-form";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { productId } = await params;
  const product = await getProductById(productId);
  return {
    title: product
      ? `${product.name} — Editar — OCCHIALE`
      : "Produto não encontrado",
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const { productId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const product = await getProductById(productId);
  if (!product) notFound();

  // Verify product belongs to store (RLS enforces, but double check)
  if (product.store_id !== membership.storeId) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Editar Produto
        </h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Atualize as informações do produto.
        </p>
      </div>

      <ProductForm
        storeId={membership.storeId}
        product={{
          id: product.id,
          name: product.name,
          description_seo: product.description_seo ?? "",
          price: product.price,
          compare_price: product.compare_price,
          category: product.category,
          brand: product.brand ?? "",
          sku: product.sku,
          images: product.images,
          specs: product.specs as Record<string, unknown> | null,
          stock_qty: product.stock_qty,
          is_active: product.is_active,
        }}
      />
    </div>
  );
}
