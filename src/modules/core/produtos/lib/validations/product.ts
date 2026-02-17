import { z } from "zod";

const productCategorySchema = z.enum([
  "oculos-grau",
  "oculos-sol",
  "lentes-contato",
  "acessorios",
  "infantil",
]);

const frameShapeSchema = z.enum([
  "redondo",
  "quadrado",
  "retangular",
  "aviador",
  "gatinho",
  "oval",
  "hexagonal",
  "clubmaster",
]);

const frameMaterialSchema = z.enum([
  "acetato",
  "metal",
  "titanio",
  "misto",
  "nylon",
]);

const faceShapeSchema = z.enum([
  "oval",
  "redondo",
  "quadrado",
  "coracao",
  "oblongo",
]);

export const productSpecsSchema = z.object({
  frameShape: frameShapeSchema.optional(),
  frameMaterial: frameMaterialSchema.optional(),
  frameColor: z.string().optional(),
  frameWidth: z.number().positive().optional(),
  bridgeWidth: z.number().positive().optional(),
  templeLength: z.number().positive().optional(),
  lensWidth: z.number().positive().optional(),
  lensHeight: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  uvProtection: z.boolean().optional(),
  polarized: z.boolean().optional(),
  idealFaceShapes: z.array(faceShapeSchema).optional(),
  gender: z.enum(["masculino", "feminino", "unissex", "infantil"]).optional(),
});

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  descriptionSeo: z.string().min(10).max(5000),
  price: z.number().int().positive(), // cents
  comparePrice: z.number().int().positive().optional(),
  category: productCategorySchema,
  brand: z.string().min(1).max(100),
  sku: z.string().max(50).optional(),
  images: z.array(z.string().url()).max(10),
  specs: productSpecsSchema,
  stockQty: z.number().int().min(0),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
