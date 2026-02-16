"use server";

import { updateServiceOrderStatus as updateStatusQuery, getServiceOrderById } from "@/lib/supabase/queries/service-orders";
import { ServiceOrderStatus } from "@/lib/supabase/queries/service-orders";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendOSStatusNotification } from "@/lib/evolution/notifications";

export async function updateOSStatusAction(
    osId: string,
    status: ServiceOrderStatus,
    notes?: string
) {
    try {
        await updateStatusQuery(osId, status, notes);

        // Notify client
        try {
            const os = await getServiceOrderById(osId);
            if (os && os.customer && os.order) {
                const supabase = await createClient();
                const { data: store } = await supabase
                    .from("stores")
                    .select("name, whatsapp_number")
                    .eq("id", os.store_id)
                    .single();

                if (store) {
                    await sendOSStatusNotification({
                        whatsappNumber: store.whatsapp_number || "",
                        customerPhone: (os.customer as any).phone || "",
                        customerName: (os.customer as any).name || "",
                        orderNumber: (os.order as any).order_number || "",
                        storeName: store.name,
                        status,
                    });
                }
            }
        } catch (notifyErr) {
            console.error("Failed to trigger OS notification:", notifyErr);
        }

        revalidatePath("/dashboard/ordens-servico");
        revalidatePath(`/dashboard/ordens-servico/${osId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating OS status:", error);
        return { success: false, error: "Falha ao atualizar status da OS" };
    }
}
