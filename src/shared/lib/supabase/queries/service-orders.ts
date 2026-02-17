import { createClient } from "../server";
import { Database } from "@/shared/types/database";

export type ServiceOrderStatus =
    | "lab_pending"
    | "waiting_material"
    | "surfacing"
    | "mounting"
    | "quality_control"
    | "ready_for_pickup"
    | "delivered"
    | "cancelled";

export async function getServiceOrders(storeId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("service_orders")
        .select(`
      *,
      order:orders(order_number),
      customer:customers(name),
      prescription:prescriptions(*)
    `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getServiceOrderById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("service_orders")
        .select(`
      *,
      order:orders(*),
      customer:customers(*),
      prescription:prescriptions(*)
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateServiceOrderStatus(
    id: string,
    status: ServiceOrderStatus,
    notes?: string
) {
    const supabase = await createClient();

    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (status === "delivered") updateData.finished_at = new Date().toISOString();

    const { error } = await supabase
        .from("service_orders")
        .update(updateData)
        .eq("id", id);

    if (error) throw error;
}

export async function createServiceOrder(params: {
    storeId: string;
    orderId: string;
    customerId: string;
    prescriptionId?: string;
    labName?: string;
    expectedAt?: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("service_orders")
        .insert({
            store_id: params.storeId,
            order_id: params.orderId,
            customer_id: params.customerId,
            prescription_id: params.prescriptionId,
            lab_name: params.labName,
            expected_at: params.expectedAt,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
