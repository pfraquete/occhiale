import { z } from "zod";

const lensConfigSchema = z.object({
  type: z.enum(["sem-grau", "monofocal", "bifocal", "progressiva", "sol"]),
  material: z
    .enum(["resina", "policarbonato", "trivex", "alto-indice"])
    .optional(),
  treatments: z
    .array(
      z.enum(["antirreflexo", "fotocromática", "filtro-azul", "polarizada"])
    )
    .optional(),
  prescriptionId: z.string().uuid().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  unitPrice: z.number().int().positive(),
  lensConfig: lensConfigSchema.optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "boleto"]),
  shippingCost: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
