import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.email("E-mail inválido"),
    phone: z
      .string()
      .min(10, "Telefone inválido")
      .max(15)
      .regex(/^[\d\s\-()]+$/, "Telefone inválido")
      .optional(),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const newPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
