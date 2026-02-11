import { NextRequest, NextResponse } from "next/server";
import {
  calculateLensCalibration,
  type Prescription,
  type FacialMeasurements,
  type FrameSpecs,
} from "@/lib/ai/lens-calibration";
import { rateLimiters } from "@/lib/utils/rate-limit";

/**
 * POST /api/ai/lens-calibration
 * Calculates lens calibration parameters from prescription + face + frame data.
 * Body: { prescription: Prescription, face: FacialMeasurements, frame: FrameSpecs }
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimiters.aiLensCalibration(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em breve." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const prescription = body.prescription as Prescription | undefined;
  const face = body.face as FacialMeasurements | undefined;
  const frame = body.frame as FrameSpecs | undefined;

  if (!prescription || !face || !frame) {
    return NextResponse.json(
      { error: "Forneça prescription, face e frame" },
      { status: 400 }
    );
  }

  // Validate prescription
  if (!prescription.od || !prescription.os) {
    return NextResponse.json(
      { error: "Receita deve conter od (olho direito) e os (olho esquerdo)" },
      { status: 400 }
    );
  }

  // Validate face measurements
  if (!face.pd || !face.dnpRight || !face.dnpLeft) {
    return NextResponse.json(
      { error: "Medidas faciais devem conter pd, dnpRight e dnpLeft" },
      { status: 400 }
    );
  }

  // Validate frame specs
  if (!frame.lensWidth || !frame.lensHeight || !frame.bridgeWidth) {
    return NextResponse.json(
      {
        error:
          "Especificações da armação devem conter lensWidth, lensHeight e bridgeWidth",
      },
      { status: 400 }
    );
  }

  try {
    const result = calculateLensCalibration(prescription, face, frame);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Lens calibration error:", err);
    return NextResponse.json(
      { error: "Erro interno ao calcular calibragem" },
      { status: 500 }
    );
  }
}
