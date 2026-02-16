import type { Database } from "@/lib/types/database";

export type InventoryMovement = Database["public"]["Tables"]["inventory_movements"]["Row"] & {
    products: { name: string; sku: string | null } | null;
    inventory_batches: { batch_number: string | null } | null;
};
export type InventoryBatch = Database["public"]["Tables"]["inventory_batches"]["Row"];
export type ABCAnalysis = Database["public"]["Views"]["inventory_abc_analysis"]["Row"];
