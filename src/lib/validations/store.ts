import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  whatsappNumber: z
    .string()
    .regex(/^\+55\d{10,11}$/, "Número deve estar no formato +55XXXXXXXXXXX")
    .optional(),
  plan: z.enum(["starter", "professional", "enterprise"]).default("starter"),
});

export const updateStoreSettingsSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().optional(),
  whatsappNumber: z
    .string()
    .regex(/^\+55\d{10,11}$/)
    .optional(),
  settings: z
    .object({
      colors: z
        .object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
        })
        .optional(),
      shipping: z
        .object({
          freeAbove: z.number().int().positive().optional(),
          defaultCost: z.number().int().min(0).optional(),
        })
        .optional(),
      policies: z
        .object({
          exchange: z.string().optional(),
          privacy: z.string().optional(),
          terms: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreSettingsInput = z.infer<
  typeof updateStoreSettingsSchema
>;
