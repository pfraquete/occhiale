"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { createServiceRoleClient } from "@/shared/lib/supabase/admin";

// ------------------------------------------
// Types
// ------------------------------------------

export interface CrmAutomation {
  id: string;
  store_id: string;
  name: string;
  trigger_type: string;
  delay_hours: number;
  action_type: string;
  template: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

const TRIGGER_TYPES = [
  "post_purchase",
  "birthday",
  "prescription_expiring",
  "inactivity",
  "nps_detractor",
  "lens_reorder",
  "abandoned_cart",
] as const;

const ACTION_TYPES = [
  "whatsapp_message",
  "email",
  "internal_alert",
  "tag_customer",
] as const;

// ------------------------------------------
// Auth Helper
// ------------------------------------------

async function authorizeStore(storeId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("store_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return null;
  }

  return user.id;
}

// ------------------------------------------
// List Automations
// ------------------------------------------

export async function listAutomationsAction(
  storeId: string
): Promise<ActionResult<CrmAutomation[]>> {
  const userId = await authorizeStore(storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("crm_automations")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as CrmAutomation[] };
}

// ------------------------------------------
// Create Automation
// ------------------------------------------

interface CreateAutomationInput {
  storeId: string;
  name: string;
  triggerType: string;
  delayHours: number;
  actionType: string;
  template?: string;
}

export async function createAutomationAction(
  input: CreateAutomationInput
): Promise<ActionResult<CrmAutomation>> {
  const userId = await authorizeStore(input.storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  // Validate trigger type
  if (
    !TRIGGER_TYPES.includes(input.triggerType as (typeof TRIGGER_TYPES)[number])
  ) {
    return { success: false, error: "Tipo de gatilho inválido" };
  }

  // Validate action type
  if (
    !ACTION_TYPES.includes(input.actionType as (typeof ACTION_TYPES)[number])
  ) {
    return { success: false, error: "Tipo de ação inválido" };
  }

  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: "Nome deve ter pelo menos 3 caracteres" };
  }

  if (input.delayHours < 0) {
    return { success: false, error: "Delay não pode ser negativo" };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("crm_automations")
    .insert({
      store_id: input.storeId,
      name: input.name.trim(),
      trigger_type: input.triggerType,
      delay_hours: input.delayHours,
      action_type: input.actionType,
      template: input.template?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/crm");
  return { success: true, data: data as CrmAutomation };
}

// ------------------------------------------
// Update Automation
// ------------------------------------------

interface UpdateAutomationInput {
  id: string;
  storeId: string;
  name?: string;
  triggerType?: string;
  delayHours?: number;
  actionType?: string;
  template?: string | null;
  isActive?: boolean;
}

export async function updateAutomationAction(
  input: UpdateAutomationInput
): Promise<ActionResult> {
  const userId = await authorizeStore(input.storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    if (input.name.trim().length < 3) {
      return { success: false, error: "Nome deve ter pelo menos 3 caracteres" };
    }
    updates.name = input.name.trim();
  }

  if (input.triggerType !== undefined) {
    if (
      !TRIGGER_TYPES.includes(
        input.triggerType as (typeof TRIGGER_TYPES)[number]
      )
    ) {
      return { success: false, error: "Tipo de gatilho inválido" };
    }
    updates.trigger_type = input.triggerType;
  }

  if (input.actionType !== undefined) {
    if (
      !ACTION_TYPES.includes(input.actionType as (typeof ACTION_TYPES)[number])
    ) {
      return { success: false, error: "Tipo de ação inválido" };
    }
    updates.action_type = input.actionType;
  }

  if (input.delayHours !== undefined) {
    updates.delay_hours = Math.max(0, input.delayHours);
  }

  if (input.template !== undefined) {
    updates.template = input.template;
  }

  if (input.isActive !== undefined) {
    updates.is_active = input.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "Nenhum campo para atualizar" };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("crm_automations")
    .update(updates)
    .eq("id", input.id)
    .eq("store_id", input.storeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/crm");
  return { success: true };
}

// ------------------------------------------
// Delete Automation
// ------------------------------------------

export async function deleteAutomationAction(
  storeId: string,
  automationId: string
): Promise<ActionResult> {
  const userId = await authorizeStore(storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("crm_automations")
    .delete()
    .eq("id", automationId)
    .eq("store_id", storeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/crm");
  return { success: true };
}
