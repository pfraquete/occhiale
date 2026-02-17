import { z } from "zod";

export const prescriptionEyeSchema = z.object({
  sphere: z.number().min(-20).max(20).multipleOf(0.25),
  cylinder: z.number().min(-10).max(0).multipleOf(0.25),
  axis: z.number().int().min(0).max(180),
});

export const prescriptionSchema = z.object({
  od: prescriptionEyeSchema,
  os: prescriptionEyeSchema,
  addition: z.number().min(0.5).max(4).multipleOf(0.25).optional(),
  dnp: z.number().min(45).max(80),
  doctorName: z.string().min(2).max(200),
  doctorCrm: z.string().optional(),
  date: z.string().date(),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;

// === OCR Result Schema ===
// Output from Claude Vision prescription analysis

export const ocrPrescriptionResultSchema = z.object({
  od: prescriptionEyeSchema,
  os: prescriptionEyeSchema,
  addition: z.number().min(0.5).max(4).multipleOf(0.25).optional().nullable(),
  dnp: z.number().min(45).max(80).optional().nullable(),
  doctorName: z.string().optional().nullable(),
  doctorCrm: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  confidence: z.enum(["high", "medium", "low"]),
  notes: z.string().optional().nullable(),
});

export type OcrPrescriptionResult = z.infer<typeof ocrPrescriptionResultSchema>;

// Validation helpers
export function isPrescriptionExpired(date: string): boolean {
  const prescriptionDate = new Date(date);
  const oneYearLater = new Date(prescriptionDate);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  return new Date() > oneYearLater;
}

export function isHighComplexity(
  od: { sphere: number; cylinder: number },
  os: { sphere: number; cylinder: number }
): boolean {
  return (
    Math.abs(od.sphere) > 8 ||
    Math.abs(os.sphere) > 8 ||
    Math.abs(od.cylinder) > 4 ||
    Math.abs(os.cylinder) > 4
  );
}
