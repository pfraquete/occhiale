// ============================================
// OCCHIALE - WhatsApp Instance Management API
// GET: status | POST: create | DELETE: disconnect
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getEvolutionClient, EvolutionApiError } from "@/modules/core/whatsapp/lib/evolution/client";

/**
 * GET /api/whatsapp/instance?storeId=xxx
 * Returns the connection status and QR code if needed.
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId");
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getUserStoreWithRole(user.id);
    if (!membership || membership.storeId !== storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const evolution = getEvolutionClient();
    const instanceName = `occhiale-${storeId}`;

    try {
      const status = await evolution.getInstanceStatus(instanceName);

      if (status.state === "open") {
        return NextResponse.json({
          status: "connected",
          instanceName,
        });
      }

      // Not connected — get QR code
      try {
        const qr = await evolution.getQRCode(instanceName);
        return NextResponse.json({
          status: "waiting_qr",
          instanceName,
          qrCode: qr.base64 ?? qr.code ?? null,
          pairingCode: qr.pairingCode ?? null,
        });
      } catch {
        return NextResponse.json({
          status: "disconnected",
          instanceName,
        });
      }
    } catch (err) {
      // Instance doesn't exist
      if (
        err instanceof EvolutionApiError &&
        (err.statusCode === 404 || err.statusCode === 400)
      ) {
        return NextResponse.json({
          status: "not_created",
          instanceName,
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("WhatsApp instance GET error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status do WhatsApp" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/instance
 * Creates a new Evolution instance and configures webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const storeId = body.storeId as string;

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Auth check — only owner/admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getUserStoreWithRole(user.id);
    if (
      !membership ||
      membership.storeId !== storeId ||
      membership.role === "member"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const evolution = getEvolutionClient();
    const instanceName = `occhiale-${storeId}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhooks/evolution`;

    // Create instance with webhook
    await evolution.createInstance(instanceName, webhookUrl);

    // Also explicitly set webhook for reliability
    await evolution.setWebhook(instanceName, {
      url: webhookUrl,
      webhook_by_events: false,
      webhook_base64: true,
      events: [
        "messages.upsert",
        "messages.update",
        "send.message",
        "connection.update",
        "qrcode.updated",
      ],
    });

    // Get QR code
    let qrCode: string | null = null;
    try {
      const qr = await evolution.getQRCode(instanceName);
      qrCode = qr.base64 ?? qr.code ?? null;
    } catch {
      // QR may not be ready immediately
    }

    return NextResponse.json(
      {
        status: "waiting_qr",
        instanceName,
        qrCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("WhatsApp instance POST error:", error);

    if (error instanceof EvolutionApiError) {
      return NextResponse.json(
        { error: `Evolution API: ${error.message}` },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar instância WhatsApp" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/instance
 * Disconnects (logout) the WhatsApp instance.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const storeId = body.storeId as string;

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Auth check — only owner/admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getUserStoreWithRole(user.id);
    if (
      !membership ||
      membership.storeId !== storeId ||
      membership.role === "member"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const evolution = getEvolutionClient();
    const instanceName = `occhiale-${storeId}`;

    await evolution.logoutInstance(instanceName);

    return NextResponse.json({ status: "disconnected" });
  } catch (error) {
    console.error("WhatsApp instance DELETE error:", error);
    return NextResponse.json(
      { error: "Erro ao desconectar WhatsApp" },
      { status: 500 }
    );
  }
}
