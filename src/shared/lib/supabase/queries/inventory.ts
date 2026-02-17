import { createClient } from "../server";
import type { Database } from "@/shared/types/database";

import type { InventoryMovement, InventoryBatch, ABCAnalysis } from "@/shared/types/inventory";

/**
 * Get inventory movements for a store with optional filters.
 */
export async function getInventoryMovements(
    storeId: string,
    options: {
        productId?: string;
        limit?: number;
        offset?: number;
    } = {}
) {
    const supabase = await createClient();
    let query = supabase
        .from("inventory_movements")
        .select(`
      *,
      products (name, sku),
      inventory_batches (batch_number)
    `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

    if (options.productId) {
        query = query.eq("product_id", options.productId);
    }

    if (options.limit) {
        const from = options.offset ?? 0;
        const to = from + options.limit - 1;
        query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Get active inventory batches for a product.
 */
export async function getProductBatches(storeId: string, productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("inventory_batches")
        .select("*")
        .eq("store_id", storeId)
        .eq("product_id", productId)
        .gt("current_qty", 0)
        .order("expiry_date", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
}

/**
 * Get ABC Analysis for a store.
 */
export async function getABCAnalysis(storeId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("inventory_abc_analysis")
        .select("*")
        .eq("store_id", storeId)
        .order("total_revenue", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Add an inventory movement and sync with batches if necessary.
 */
export async function addInventoryMovement(
    movement: Database["public"]["Tables"]["inventory_movements"]["Insert"]
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("inventory_movements")
        .insert(movement)
        .select()
        .single();

    if (error) throw error;

    // Manual update of batch current_qty if applicable
    if (movement.batch_id && movement.quantity !== 0) {
        const { error: batchError } = await supabase.rpc("increment_batch_qty", {
            p_batch_id: movement.batch_id,
            p_increment: movement.quantity
        });

        if (batchError) throw batchError;
    }

    return data;
}

/**
 * Create a new inventory batch.
 */
export async function createInventoryBatch(
    batch: Database["public"]["Tables"]["inventory_batches"]["Insert"]
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("inventory_batches")
        .insert(batch)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get count of batches expiring within a certain number of days.
 */
export async function getExpiringBatchesCount(storeId: string, days: number = 30) {
    const supabase = await createClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { count, error } = await supabase
        .from("inventory_batches")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .gt("current_qty", 0)
        .lte("expiry_date", futureDate.toISOString())
        .gte("expiry_date", new Date().toISOString());

    if (error) throw error;
    return count || 0;
}
