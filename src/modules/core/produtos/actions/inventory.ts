"use server";

import { createInventoryBatch, addInventoryMovement } from "@/shared/lib/supabase/queries/inventory";
import { Database } from "@/shared/types/database";

export async function createBatchAction(data: Database["public"]["Tables"]["inventory_batches"]["Insert"]) {
    return await createInventoryBatch(data);
}

export async function addMovementAction(data: Database["public"]["Tables"]["inventory_movements"]["Insert"]) {
    return await addInventoryMovement(data);
}
