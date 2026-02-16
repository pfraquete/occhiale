"use server";

import { createInventoryBatch, addInventoryMovement } from "@/lib/supabase/queries/inventory";
import { Database } from "@/lib/types/database";

export async function createBatchAction(data: Database["public"]["Tables"]["inventory_batches"]["Insert"]) {
    return await createInventoryBatch(data);
}

export async function addMovementAction(data: Database["public"]["Tables"]["inventory_movements"]["Insert"]) {
    return await addInventoryMovement(data);
}
