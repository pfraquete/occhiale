import { z } from "zod";

export const orderStatusValues = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(orderStatusValues),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/**
 * Valid status transitions for orders.
 */
export const validStatusTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
  failed: [],
};

export const inviteMemberSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "member"], {
    message: "Selecione uma função",
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/** General store settings form schema */
export const generalSettingsSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsappNumber: z
    .string()
    .regex(/^\+55\d{10,11}$/, "Formato: +55XXXXXXXXXXX")
    .optional()
    .or(z.literal("")),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

/** Shipping settings form schema */
export const shippingSettingsSchema = z.object({
  defaultCost: z.number().int().min(0, "Custo não pode ser negativo"),
  freeAbove: z.number().int().min(0).optional(),
});

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;
