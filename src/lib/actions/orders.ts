"use server";

import { revalidatePath } from "next/cache";
import {
  updateOrderStatusSchema,
  validStatusTransitions,
} from "@/lib/validations/dashboard";
import {
  updateOrderStatus,
  getOrderById,
} from "@/lib/supabase/queries/dashboard-orders";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update order status with transition validation.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<ActionResult> {
  const parsed = updateOrderStatusSchema.safeParse({
    orderId,
    status: newStatus,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  // Get current order to validate transition
  const order = await getOrderById(orderId);
  if (!order) {
    return { success: false, error: "Pedido não encontrado" };
  }

  const currentStatus = order.status;
  const allowedTransitions = validStatusTransitions[currentStatus] ?? [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `Não é possível alterar de "${currentStatus}" para "${newStatus}"`,
    };
  }

  try {
    await updateOrderStatus(orderId, newStatus);
    revalidatePath("/dashboard/pedidos");
    revalidatePath(`/dashboard/pedidos/${orderId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao atualizar pedido",
    };
  }
}

/**
 * Cancel an order (shortcut for status → cancelled).
 */
export async function cancelOrderAction(
  orderId: string
): Promise<ActionResult> {
  return updateOrderStatusAction(orderId, "cancelled");
}
