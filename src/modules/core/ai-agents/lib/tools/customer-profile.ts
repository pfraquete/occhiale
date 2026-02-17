// ============================================
// OCCHIALE - AI Tool: Customer Profile
// Looks up customer data by phone number
// ============================================

import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import type { ToolContext } from "./index";

/**
 * Normalize a phone number by stripping non-digit characters.
 * Handles common Brazilian formats: (11) 99999-9999, +55 11 99999-9999, etc.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function executeCustomerProfile(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const phone = input.phone as string | undefined;

  if (!phone) {
    return JSON.stringify({ error: "Telefone não fornecido." });
  }

  const supabase = createServiceRoleClient();

  // FIX: Normalize phone number for consistent lookup
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    return JSON.stringify({ error: "Número de telefone inválido." });
  }

  // Find customer by phone + store
  // FIX: .single() → .maybeSingle() to avoid throwing when no rows found
  // FIX: Removed ltv, nps_score from select — sensitive data not needed by AI
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, email, phone, face_shape, preferences, last_purchase_at, created_at"
    )
    .eq("store_id", context.storeId)
    .eq("phone", normalizedPhone)
    .limit(1)
    .maybeSingle();

  if (!customer) {
    // FIX: Also try with the original phone format in case DB stores formatted numbers
    const { data: customerAlt } = await supabase
      .from("customers")
      .select(
        "id, name, email, phone, face_shape, preferences, last_purchase_at, created_at"
      )
      .eq("store_id", context.storeId)
      .eq("phone", phone)
      .limit(1)
      .maybeSingle();

    if (!customerAlt) {
      return JSON.stringify({
        found: false,
        message: "Cliente não encontrado no cadastro. É um novo cliente!",
      });
    }

    // Use the alt result
    return buildCustomerResponse(supabase, customerAlt, context.storeId);
  }

  return buildCustomerResponse(supabase, customer, context.storeId);
}

async function buildCustomerResponse(
  supabase: ReturnType<typeof createServiceRoleClient>,
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    face_shape: string | null;
    preferences: unknown;
    last_purchase_at: string | null;
    created_at: string;
  },
  storeId: string
): Promise<string> {
  // Get recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("store_id", storeId)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(
      "id, od_sphere, od_cylinder, od_axis, os_sphere, os_cylinder, os_axis, addition, dnp, doctor_name, prescription_date, expires_at"
    )
    .eq("store_id", storeId)
    .eq("customer_id", customer.id)
    .order("prescription_date", { ascending: false })
    .limit(2);

  return JSON.stringify({
    found: true,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      faceShape: customer.face_shape,
      lastPurchase: customer.last_purchase_at,
      memberSince: customer.created_at,
      // FIX: Removed ltv, npsScore, engagementScore — sensitive business metrics
      // should not be exposed to the AI context
    },
    recentOrders:
      orders?.map((o) => ({
        number: o.order_number,
        status: o.status,
        total: formatCentsToBRL(o.total),
        date: o.created_at,
      })) ?? [],
    prescriptions:
      prescriptions?.map((p) => ({
        id: p.id,
        od: { sphere: p.od_sphere, cylinder: p.od_cylinder, axis: p.od_axis },
        os: { sphere: p.os_sphere, cylinder: p.os_cylinder, axis: p.os_axis },
        addition: p.addition,
        dnp: p.dnp,
        doctor: p.doctor_name,
        date: p.prescription_date,
        expiresAt: p.expires_at,
      })) ?? [],
  });
}
