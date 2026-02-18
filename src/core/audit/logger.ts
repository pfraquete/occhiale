// ============================================================================
// Audit Logger - Immutable Audit Trail
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import type { AuditLog } from "../types";

interface CreateAuditLogParams {
  organizationId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an immutable audit log entry.
 * Call this for every important action in the system.
 *
 * @example
 * await createAuditLog({
 *   organizationId: org.id,
 *   userId: user.id,
 *   action: 'create',
 *   entity: 'product',
 *   entityId: product.id,
 *   newData: { name: product.name, price: product.price },
 * });
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<AuditLog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      organization_id: params.organizationId,
      user_id: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[AuditLog] Failed to create audit log:", error.message);
    return null;
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    userId: data.user_id,
    action: data.action,
    entity: data.entity,
    entityId: data.entity_id,
    oldData: data.old_data as Record<string, unknown> | null,
    newData: data.new_data as Record<string, unknown> | null,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    createdAt: data.created_at,
  };
}

/**
 * Query audit logs for an organization with filtering.
 */
export async function queryAuditLogs(
  organizationId: string,
  options?: {
    entity?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ logs: AuditLog[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (options?.entity) query = query.eq("entity", options.entity);
  if (options?.entityId) query = query.eq("entity_id", options.entityId);
  if (options?.userId) query = query.eq("user_id", options.userId);
  if (options?.action) query = query.eq("action", options.action);
  if (options?.from) query = query.gte("created_at", options.from);
  if (options?.to) query = query.lte("created_at", options.to);

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[AuditLog] Failed to query audit logs:", error.message);
    return { logs: [], total: 0 };
  }

  const logs: AuditLog[] = (data ?? []).map((d) => ({
    id: d.id,
    organizationId: d.organization_id,
    userId: d.user_id,
    action: d.action,
    entity: d.entity,
    entityId: d.entity_id,
    oldData: d.old_data as Record<string, unknown> | null,
    newData: d.new_data as Record<string, unknown> | null,
    ipAddress: d.ip_address,
    userAgent: d.user_agent,
    createdAt: d.created_at,
  }));

  return { logs, total: count ?? 0 };
}
