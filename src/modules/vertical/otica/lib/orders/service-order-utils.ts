import { createClient } from "@/shared/lib/supabase/server";
import { createServiceOrder } from "@/shared/lib/supabase/queries/service-orders";

/**
 * Checks if an order needs a Service Order (OS) and creates it if necessary.
 * An OS is needed if any item in the order brand belongs to the 'grau' category
 * or has lens_config.
 */
export async function ensureServiceOrder(orderId: string) {
    const supabase = await createClient();

    // 1. Fetch order details with items and their categories
    const { data: order, error } = await supabase
        .from("orders")
        .select(`
            id,
            store_id,
            customer_id,
            order_items (
                product_id,
                lens_config,
                products (category)
            )
        `)
        .eq("id", orderId)
        .single();

    if (error || !order) {
        console.error("Error fetching order for OS check:", error);
        return;
    }

    // 2. Check if already has an OS to avoid duplicates
    const { count } = await supabase
        .from("service_orders")
        .select("id", { count: "exact", head: true })
        .eq("order_id", orderId);

    if (count && count > 0) return;

    // 3. Determine if OS is needed
    const needsOS = order.order_items.some((item: any) =>
        item.products?.category === "grau" || item.lens_config
    );

    if (!needsOS) return;

    // 4. Find the most recent prescription for this customer to link if possible
    const { data: prescription } = await supabase
        .from("prescriptions")
        .select("id")
        .eq("customer_id", order.customer_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    // 5. Create the OS
    try {
        await createServiceOrder({
            storeId: order.store_id,
            orderId: order.id,
            customerId: order.customer_id,
            prescriptionId: prescription?.id,
        });
        console.log(`Service Order created for order ${orderId}`);
    } catch (err) {
        console.error("Failed to create Service Order:", err);
    }
}
