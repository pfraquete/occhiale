// ============================================
// OCCHIALE - AI Tool: Calculate Lens Calibration
// Calculates lens mounting parameters from
// prescription + face measurements + frame specs
// ============================================

import {
  calculateLensCalibration,
  type Prescription,
  type FacialMeasurements,
  type FrameSpecs,
} from "@/lib/ai/lens-calibration";
import type { ToolContext } from "./index";

export async function executeCalculateLens(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<string> {
  // Extract prescription
  const prescription = input.prescription as Prescription | undefined;
  const odSphere = input.odSphere as number | undefined;

  if (!prescription && odSphere === undefined) {
    return JSON.stringify({
      error:
        "Receita não fornecida. Peça ao cliente para enviar a receita ou informar os valores de grau.",
      requiredFields: {
        prescription: {
          od: "Olho direito: esférico, cilíndrico, eixo, adição",
          os: "Olho esquerdo: esférico, cilíndrico, eixo, adição",
        },
        faceMeasurements: "DP, DNP direito, DNP esquerdo",
        frameSpecs: "Largura da lente, altura da lente, ponte",
      },
      suggestion:
        "Você pode usar a ferramenta analyze_prescription para extrair os dados de uma foto da receita, e face_measurement para medir o rosto.",
    });
  }

  // Build prescription from individual fields if not provided as object
  const rx: Prescription = prescription ?? {
    od: {
      sphere: odSphere ?? 0,
      cylinder: (input.odCylinder as number) ?? 0,
      axis: (input.odAxis as number) ?? 0,
      addition: (input.odAddition as number) ?? 0,
    },
    os: {
      sphere: (input.osSphere as number) ?? 0,
      cylinder: (input.osCylinder as number) ?? 0,
      axis: (input.osAxis as number) ?? 0,
      addition: (input.osAddition as number) ?? 0,
    },
  };

  // Extract face measurements
  const face = input.face as FacialMeasurements | undefined;
  const pd = input.pd as number | undefined;

  if (!face && !pd) {
    return JSON.stringify({
      error:
        "Medidas faciais não fornecidas. Preciso pelo menos da DP (distância pupilar).",
      suggestion:
        "Use a ferramenta face_measurement para medir o rosto do cliente, ou peça a DP diretamente.",
    });
  }

  const facialMeasurements: FacialMeasurements = face ?? {
    pd: pd!,
    dnpRight: (input.dnpRight as number) ?? pd! / 2,
    dnpLeft: (input.dnpLeft as number) ?? pd! / 2,
    ocHeight: input.ocHeight as number | undefined,
  };

  // Extract frame specs
  const frame = input.frame as FrameSpecs | undefined;
  const lensWidth = input.lensWidth as number | undefined;

  if (!frame && !lensWidth) {
    return JSON.stringify({
      error:
        "Medidas da armação não fornecidas. Preciso da largura da lente, altura e ponte.",
      suggestion:
        "As medidas geralmente estão impressas na haste interna da armação (ex: 54□17-140). Peça ao cliente para verificar.",
    });
  }

  const frameSpecs: FrameSpecs = frame ?? {
    lensWidth: lensWidth!,
    lensHeight: (input.lensHeight as number) ?? 40,
    bridgeWidth: (input.bridgeWidth as number) ?? 17,
    templeLength: (input.templeLength as number) ?? 140,
  };

  // Validate basic ranges
  if (facialMeasurements.pd < 40 || facialMeasurements.pd > 80) {
    return JSON.stringify({
      error: `DP de ${facialMeasurements.pd}mm está fora do intervalo normal (40-80mm). Verifique o valor.`,
    });
  }

  if (frameSpecs.lensWidth < 30 || frameSpecs.lensWidth > 70) {
    return JSON.stringify({
      error: `Largura da lente de ${frameSpecs.lensWidth}mm está fora do intervalo normal (30-70mm). Verifique o valor.`,
    });
  }

  try {
    const result = calculateLensCalibration(rx, facialMeasurements, frameSpecs);

    // Format for WhatsApp-friendly output
    const lensTypeLabels: Record<string, string> = {
      "visao-simples": "Visão Simples",
      bifocal: "Bifocal",
      progressivo: "Progressivo",
      ocupacional: "Ocupacional",
    };

    return JSON.stringify({
      success: true,
      summary: {
        lensType: lensTypeLabels[result.lensType] ?? result.lensType,
        refractiveIndex: `${result.refractiveIndex.value} (${result.refractiveIndex.name})`,
        refractiveReason: result.refractiveIndex.reason,
        minimumBlankSize: `${result.minimumBlankSize}mm`,
        decentration: `${result.decentration}mm`,
      },
      olhoDireito: {
        equivalenteEsferico: `${result.od.sphericalEquivalent >= 0 ? "+" : ""}${result.od.sphericalEquivalent.toFixed(2)}D`,
        alturaMontagem: `${result.od.fittingHeight}mm`,
        espessuraCentro: `${result.od.estimatedCenterThickness}mm`,
        espessuraBorda: `${result.od.estimatedEdgeThickness}mm`,
        prismaInduzido: `${result.od.inducedPrism.toFixed(2)}Δ`,
      },
      olhoEsquerdo: {
        equivalenteEsferico: `${result.os.sphericalEquivalent >= 0 ? "+" : ""}${result.os.sphericalEquivalent.toFixed(2)}D`,
        alturaMontagem: `${result.os.fittingHeight}mm`,
        espessuraCentro: `${result.os.estimatedCenterThickness}mm`,
        espessuraBorda: `${result.os.estimatedEdgeThickness}mm`,
        prismaInduzido: `${result.os.inducedPrism.toFixed(2)}Δ`,
      },
      treatments: result.treatments.map((t) => ({
        name: t.name,
        priority: t.priority,
        reason: t.reason,
      })),
      warnings: result.warnings,
      labReport: result.labSummary,
      message:
        `Calculei a calibragem das suas lentes! Tipo: ${lensTypeLabels[result.lensType]}, Índice: ${result.refractiveIndex.value}. ` +
        (result.warnings.length > 0
          ? `Atenção: ${result.warnings.length} alerta(s) encontrado(s).`
          : "Tudo dentro dos parâmetros normais."),
    });
  } catch (error) {
    console.error("Lens calibration error:", error);
    return JSON.stringify({
      error:
        "Erro ao calcular a calibragem. Verifique se os valores estão corretos.",
    });
  }
}
