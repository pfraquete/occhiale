"use server";

import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  toggleProductActive,
} from "@/lib/supabase/queries/dashboard-products";
import { addInventoryMovement } from "@/lib/supabase/queries/inventory";
import type { Json } from "@/lib/types/database";

export interface ActionResult {
  success: boolean;
  error?: string;
  productId?: string;
}

/**
 * Create a new product.
 */
export async function createProductAction(
  storeId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const result = await createProduct(storeId, {
      name: parsed.data.name,
      description_seo: parsed.data.descriptionSeo,
      price: parsed.data.price,
      compare_price: parsed.data.comparePrice,
      category: parsed.data.category,
      brand: parsed.data.brand,
      sku: parsed.data.sku,
      images: parsed.data.images,
      specs: parsed.data.specs as Json,
      stock_qty: parsed.data.stockQty,
      is_active: parsed.data.isActive,
    });

    revalidatePath("/dashboard/produtos");

    // Record initial stock movement if quantity > 0
    if (parsed.data.stockQty > 0) {
      await addInventoryMovement({
        store_id: storeId,
        product_id: result.id,
        type: "entry",
        quantity: parsed.data.stockQty,
        reason: "Initial stock entry during product creation",
      });
    }

    return { success: true, productId: result.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao criar produto",
    };
  }
}

/**
 * Update an existing product.
 */
export async function updateProductAction(
  productId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = productSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.descriptionSeo !== undefined)
      updateData.description_seo = parsed.data.descriptionSeo;
    if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
    if (parsed.data.comparePrice !== undefined)
      updateData.compare_price = parsed.data.comparePrice;
    if (parsed.data.category !== undefined)
      updateData.category = parsed.data.category;
    if (parsed.data.brand !== undefined) updateData.brand = parsed.data.brand;
    if (parsed.data.sku !== undefined) updateData.sku = parsed.data.sku;
    if (parsed.data.images !== undefined)
      updateData.images = parsed.data.images;
    if (parsed.data.specs !== undefined) updateData.specs = parsed.data.specs;
    // If stock_qty was updated, record a movement
    if (parsed.data.stockQty !== undefined) {
      const oldProduct = await getProductById(productId);
      if (oldProduct && oldProduct.stock_qty !== parsed.data.stockQty) {
        const diff = parsed.data.stockQty - oldProduct.stock_qty;
        await addInventoryMovement({
          store_id: oldProduct.store_id,
          product_id: productId,
          type: "adjustment",
          quantity: diff,
          reason: "Manual stock adjustment via product edit",
        });
      }
    }
    if (parsed.data.isActive !== undefined)
      updateData.is_active = parsed.data.isActive;

    await updateProduct(productId, updateData);
    revalidatePath("/dashboard/produtos");
    revalidatePath(`/dashboard/produtos/${productId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao atualizar produto",
    };
  }
}

/**
 * Delete a product.
 */
export async function deleteProductAction(
  productId: string
): Promise<ActionResult> {
  try {
    await deleteProduct(productId);
    revalidatePath("/dashboard/produtos");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao excluir produto",
    };
  }
}

/**
 * Toggle product active status.
 */
export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await toggleProductActive(productId, isActive);
    revalidatePath("/dashboard/produtos");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao alterar status do produto",
    };
  }
}
