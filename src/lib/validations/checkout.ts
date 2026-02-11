import { z } from "zod/v4";

// === Customer Info ===
export const customerInfoSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .max(15)
    .regex(/^[\d\s\-()]+$/, "Telefone inválido"),
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d{11}$/, "CPF inválido"),
});

export type CustomerInfoInput = z.infer<typeof customerInfoSchema>;

// === Shipping Address ===
export const shippingAddressSchema = z.object({
  zipCode: z
    .string()
    .length(8, "CEP deve ter 8 dígitos")
    .regex(/^\d{8}$/, "CEP inválido"),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z
    .string()
    .length(2, "UF deve ter 2 letras")
    .regex(/^[A-Z]{2}$/, "UF inválida"),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

// === Credit Card ===
export const creditCardSchema = z.object({
  number: z
    .string()
    .min(13)
    .max(19)
    .regex(/^\d+$/, "Número do cartão inválido"),
  holderName: z.string().min(3, "Nome no cartão é obrigatório"),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(new Date().getFullYear()),
  cvv: z.string().min(3).max(4).regex(/^\d+$/, "CVV inválido"),
  installments: z.number().int().min(1).max(12),
});

export type CreditCardInput = z.infer<typeof creditCardSchema>;

// === Full Checkout ===
export const checkoutSchema = z.object({
  storeId: z.string().uuid(),
  customer: customerInfoSchema,
  shipping: shippingAddressSchema,
  paymentMethod: z.enum(["pix", "credit_card", "boleto"]),
  creditCard: creditCardSchema.optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().int().min(1),
        lensConfig: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .min(1, "Carrinho vazio"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
