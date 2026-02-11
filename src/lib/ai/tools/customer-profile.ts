// ============================================
// OCCHIALE - AI Tool: Customer Profile
// Looks up customer data by phone number
// ============================================

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { formatCentsToBRL } from "@/lib/utils/format";
import type { ToolContext } from "./index";

export async function executeCustomerProfile(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const phone = input.phone as string | undefined;

  if (!phone) {
    return JSON.stringify({ error: "Telefone não fornecido." });
  }

  const supabase = createServiceRoleClient();

  // Find customer by phone + store
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, email, phone, face_shape, preferences, ltv, last_purchase_at, nps_score, engagement_score, created_at"
    )
    .eq("store_id", context.storeId)
    .eq("phone", phone)
    .limit(1)
    .single();

  if (!customer) {
    return JSON.stringify({
      found: false,
      message: "Cliente não encontrado no cadastro. É um novo cliente!",
    });
  }

  // Get recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("store_id", context.storeId)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get prescriptions
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(
      "id, od_sphere, od_cylinder, od_axis, os_sphere, os_cylinder, os_axis, addition, dnp, doctor_name, prescription_date, expires_at"
    )
    .eq("store_id", context.storeId)
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
      ltv: formatCentsToBRL(customer.ltv ?? 0),
      lastPurchase: customer.last_purchase_at,
      npsScore: customer.nps_score,
      engagementScore: customer.engagement_score,
      memberSince: customer.created_at,
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
