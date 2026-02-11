"use server";

import { revalidatePath } from "next/cache";
import {
  generalSettingsSchema,
  shippingSettingsSchema,
  inviteMemberSchema,
} from "@/lib/validations/dashboard";
import {
  updateStoreSettings,
  removeStoreMember,
} from "@/lib/supabase/queries/dashboard-store";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update general store settings (name, description, logo, whatsapp).
 */
export async function updateGeneralSettingsAction(
  storeId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = generalSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await updateStoreSettings(storeId, {
      name: parsed.data.name,
      logo_url: parsed.data.logoUrl || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      description: parsed.data.description || null,
    });

    revalidatePath("/dashboard/configuracoes");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Erro ao salvar configurações",
    };
  }
}

/**
 * Update shipping settings.
 */
export async function updateShippingSettingsAction(
  storeId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = shippingSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    // Merge into existing settings JSON
    const supabase = await createClient();
    const { data: store } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", storeId)
      .single();

    const currentSettings = (store?.settings ?? {}) as Record<string, unknown>;
    const newSettings = {
      ...currentSettings,
      shipping: {
        defaultCost: parsed.data.defaultCost,
        freeAbove: parsed.data.freeAbove ?? null,
      },
    };

    await updateStoreSettings(storeId, { settings: newSettings });
    revalidatePath("/dashboard/configuracoes/frete");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Erro ao salvar configurações de frete",
    };
  }
}

/**
 * Invite a member to the store.
 */
export async function inviteMemberAction(
  storeId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = inviteMemberSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const supabase = await createClient();

    // Check if user exists by searching store_members or auth
    // For MVP, we'll insert directly — if user_id doesn't exist, RLS will reject
    // This is a simplified approach; proper invite flow would send email
    const { error } = await supabase.from("store_members").insert({
      store_id: storeId,
      user_id: "placeholder", // In real implementation, look up user by email
      role: parsed.data.role,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Este membro já faz parte da equipe" };
      }
      return {
        success: false,
        error: "Usuário não encontrado. Peça para criar uma conta primeiro.",
      };
    }

    revalidatePath("/dashboard/configuracoes/equipe");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao convidar membro",
    };
  }
}

/**
 * Remove a member from the store.
 */
export async function removeMemberAction(
  memberId: string
): Promise<ActionResult> {
  try {
    await removeStoreMember(memberId);
    revalidatePath("/dashboard/configuracoes/equipe");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao remover membro",
    };
  }
}
