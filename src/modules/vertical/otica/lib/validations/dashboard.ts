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
  role: z.enum(["admin", "member"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const generalSettingsSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  whatsappNumber: z.string().optional(),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

export const shippingSettingsSchema = z.object({
  defaultCost: z.number().int().min(0),
  freeAbove: z.number().int().min(0).optional(),
});

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;
