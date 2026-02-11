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
import { createServiceRoleClient } from "@/lib/supabase/admin";

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
 * Invite a member to the store by email.
 * Looks up the user in Supabase Auth by email using service role.
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
    // 1. Auth check — ensure caller is owner/admin of this store
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Não autenticado" };
    }

    const { data: callerMembership } = await supabase
      .from("store_members")
      .select("role")
      .eq("store_id", storeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      !callerMembership ||
      !["owner", "admin"].includes(callerMembership.role)
    ) {
      return {
        success: false,
        error: "Apenas proprietários e administradores podem convidar membros",
      };
    }

    // 2. Look up the invited user by email using service role admin API
    const adminClient = createServiceRoleClient();
    let targetUserId: string | null = null;

    // Use admin.listUsers to search by email
    // Supabase admin API supports listing users; we search through results
    const { data: usersData, error: listError } =
      await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 50,
      });

    if (usersData?.users && !listError) {
      const found = usersData.users.find(
        (u) => u.email?.toLowerCase() === parsed.data.email.toLowerCase()
      );
      if (found) {
        targetUserId = found.id;
      }
    }

    if (!targetUserId) {
      return {
        success: false,
        error:
          "Usuário não encontrado com este e-mail. Peça para criar uma conta primeiro.",
      };
    }

    // 3. Check if already a member
    const { data: existingMember } = await adminClient
      .from("store_members")
      .select("id")
      .eq("store_id", storeId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (existingMember) {
      return { success: false, error: "Este usuário já faz parte da equipe" };
    }

    // 4. Add member
    const { error: insertError } = await adminClient
      .from("store_members")
      .insert({
        store_id: storeId,
        user_id: targetUserId,
        role: parsed.data.role,
      });

    if (insertError) {
      console.error("Failed to invite member:", insertError);
      if (insertError.code === "23505") {
        return { success: false, error: "Este membro já faz parte da equipe" };
      }
      return {
        success: false,
        error: "Erro ao adicionar membro. Tente novamente.",
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
