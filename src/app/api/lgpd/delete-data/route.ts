import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createServiceRoleClient } from "@/shared/lib/supabase/admin";

/**
 * LGPD Data Deletion Request
 * Allows authenticated users to request deletion of their personal data.
 *
 * POST /api/lgpd/delete-data
 * Body: { confirmEmail: string }
 *
 * This will:
 * 1. Delete customer records across all stores
 * 2. Anonymize WhatsApp conversation data
 * 3. Delete the user's auth account
 *
 * Note: Order records are retained (anonymized) for fiscal compliance (5 years).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { confirmEmail } = body;

    // Require email confirmation to prevent accidental deletion
    if (confirmEmail !== user.email) {
      return NextResponse.json(
        { error: "E-mail de confirmação não confere" },
        { status: 400 }
      );
    }

    const admin = createServiceRoleClient();

    // 1. Anonymize customer records (keep order history for fiscal compliance)
    const { data: customers } = await admin
      .from("customers")
      .select("id")
      .eq("email", user.email ?? "");

    if (customers?.length) {
      const customerIds = customers.map((c) => c.id);

      // Anonymize customer data
      for (const customerId of customerIds) {
        await admin
          .from("customers")
          .update({
            name: "Dados removidos (LGPD)",
            email: `deleted_${customerId}@removed.lgpd`,
            phone: null,
            cpf: null,
            birth_date: null,
            notes: "Dados pessoais removidos a pedido do titular (LGPD)",
          })
          .eq("id", customerId);
      }
    }

    // 2. Anonymize WhatsApp conversations
    await admin
      .from("whatsapp_conversations")
      .update({
        customer_name: "Removido (LGPD)",
        phone: "0000000000000",
      })
      .eq("phone", user.phone ?? "none");

    // 3. Delete WhatsApp messages content (keep metadata for audit)
    // Messages are linked to conversations, not directly to users
    // We anonymize the conversation instead

    // 4. Remove store memberships (if user is not an owner)
    await admin
      .from("store_members")
      .delete()
      .eq("user_id", user.id)
      .neq("role", "owner");

    // 5. For store owners, we can't auto-delete — they need to delete the store first
    const { data: ownedStores } = await admin
      .from("store_members")
      .select("store_id")
      .eq("user_id", user.id)
      .eq("role", "owner");

    if (ownedStores?.length) {
      return NextResponse.json(
        {
          error:
            "Você possui lojas ativas. Transfira a propriedade ou exclua suas lojas antes de solicitar a exclusão da conta.",
          stores: ownedStores.map((s) => s.store_id),
        },
        { status: 400 }
      );
    }

    // 6. Delete the auth user
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return NextResponse.json(
        { error: "Erro ao excluir conta. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Seus dados pessoais foram removidos. Dados de transações serão mantidos de forma anônima por 5 anos conforme legislação fiscal.",
    });
  } catch (error) {
    console.error("LGPD delete error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar solicitação" },
      { status: 500 }
    );
  }
}
