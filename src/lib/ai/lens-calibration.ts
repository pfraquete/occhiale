// ============================================
// OCCHIALE - Lens Calibration Calculator
// Calculates all lens mounting parameters from:
// - Prescription (OD/OS sphere, cylinder, axis, addition)
// - Face measurements (PD, DNP, OC height)
// - Frame specs (lens width, bridge, temple length)
// ============================================

// ------------------------------------------
// Types
// ------------------------------------------

export interface PrescriptionEye {
  /** Grau esférico (dioptrias). Negativo = miopia, Positivo = hipermetropia */
  sphere: number;
  /** Grau cilíndrico (dioptrias). Sempre negativo ou zero */
  cylinder: number;
  /** Eixo do cilindro (0-180 graus) */
  axis: number;
  /** Adição para perto (dioptrias). 0 = sem adição */
  addition: number;
}

export interface Prescription {
  /** Olho direito */
  od: PrescriptionEye;
  /** Olho esquerdo */
  os: PrescriptionEye;
}

export interface FrameSpecs {
  /** Largura da lente (mm) */
  lensWidth: number;
  /** Altura da lente (mm) */
  lensHeight: number;
  /** Largura da ponte (mm) */
  bridgeWidth: number;
  /** Comprimento da haste (mm) */
  templeLength: number;
}

export interface FacialMeasurements {
  /** Distância pupilar total (mm) */
  pd: number;
  /** DNP olho direito (mm) */
  dnpRight: number;
  /** DNP olho esquerdo (mm) */
  dnpLeft: number;
  /** Altura pupilar / OC Height (mm) — medida com armação no rosto */
  ocHeight?: number;
}

export interface LensCalibrationResult {
  /** Parâmetros do olho direito */
  od: EyeCalibration;
  /** Parâmetros do olho esquerdo */
  os: EyeCalibration;
  /** Tipo de lente recomendado */
  lensType: LensType;
  /** Índice de refração recomendado */
  refractiveIndex: RefractiveIndex;
  /** Tratamentos recomendados */
  treatments: Treatment[];
  /** Tamanho mínimo do blank (mm) */
  minimumBlankSize: number;
  /** Descentração horizontal (mm) */
  decentration: number;
  /** Alertas e recomendações */
  warnings: string[];
  /** Resumo técnico para o laboratório */
  labSummary: string;
}

export interface EyeCalibration {
  /** Grau esférico equivalente */
  sphericalEquivalent: number;
  /** Centro óptico horizontal (mm do centro da lente) */
  opticalCenterH: number;
  /** Centro óptico vertical (mm da base da lente) */
  opticalCenterV: number;
  /** Espessura estimada da borda (mm) — para lentes negativas */
  estimatedEdgeThickness: number;
  /** Espessura estimada do centro (mm) — para lentes positivas */
  estimatedCenterThickness: number;
  /** Prisma induzido pela descentração (dioptrias prismáticas) */
  inducedPrism: number;
  /** Altura de montagem (mm) */
  fittingHeight: number;
}

export type LensType =
  | "visao-simples"
  | "bifocal"
  | "progressivo"
  | "ocupacional";

export interface RefractiveIndex {
  value: number;
  name: string;
  reason: string;
}

export interface Treatment {
  name: string;
  reason: string;
  priority: "essencial" | "recomendado" | "opcional";
}

// ------------------------------------------
// Constants
// ------------------------------------------

/** Espessura mínima do centro para lentes negativas (mm) */
const MIN_CENTER_THICKNESS = 1.5;

/** Espessura mínima da borda para lentes positivas (mm) */
const MIN_EDGE_THICKNESS = 1.0;

/** BVD padrão (mm) */
const DEFAULT_BVD = 12;

// ------------------------------------------
// Main Calculation
// ------------------------------------------

/**
 * Calculate all lens calibration parameters.
 */
export function calculateLensCalibration(
  prescription: Prescription,
  face: FacialMeasurements,
  frame: FrameSpecs
): LensCalibrationResult {
  const warnings: string[] = [];

  // 1. Frame PD and decentration
  const framePD = frame.lensWidth + frame.bridgeWidth;
  const decentration = (framePD - face.pd) / 2;

  if (Math.abs(decentration) > 5) {
    warnings.push(
      `Descentração elevada (${decentration.toFixed(1)}mm). Considere uma armação com largura mais adequada à DP do paciente.`
    );
  }

  // 2. OC Height (default to lens center if not measured)
  const ocHeight = face.ocHeight ?? Math.round(frame.lensHeight / 2);
  if (!face.ocHeight) {
    warnings.push(
      "Altura pupilar não informada. Usando centro da lente como referência. Para maior precisão, meça a altura com a armação no rosto."
    );
  }

  // 3. Determine lens type
  const lensType = determineLensType(prescription);

  // 4. Determine refractive index
  const maxSphere = Math.max(
    Math.abs(prescription.od.sphere),
    Math.abs(prescription.os.sphere)
  );
  const refractiveIndex = determineRefractiveIndex(maxSphere);

  // 5. Calculate per-eye parameters
  const od = calculateEyeParams(
    prescription.od,
    face.dnpRight,
    ocHeight,
    frame,
    decentration,
    refractiveIndex.value,
    lensType
  );

  const os = calculateEyeParams(
    prescription.os,
    face.dnpLeft,
    ocHeight,
    frame,
    decentration,
    refractiveIndex.value,
    lensType
  );

  // 6. Minimum blank size
  const edOD = calculateEffectiveDiameter(frame);
  const edOS = calculateEffectiveDiameter(frame);
  const mbsOD = edOD + Math.abs(od.opticalCenterH) + 2;
  const mbsOS = edOS + Math.abs(os.opticalCenterH) + 2;
  const minimumBlankSize = Math.max(mbsOD, mbsOS);

  // 7. Treatments
  const treatments = recommendTreatments(prescription, lensType);

  // 8. Anisometropia check
  const sphereDiff = Math.abs(prescription.od.sphere - prescription.os.sphere);
  if (sphereDiff > 2) {
    warnings.push(
      `Anisometropia significativa (${sphereDiff.toFixed(2)}D). Considere lentes asféricas para reduzir diferença de magnificação.`
    );
  }

  // 9. High cylinder check
  const maxCylinder = Math.max(
    Math.abs(prescription.od.cylinder),
    Math.abs(prescription.os.cylinder)
  );
  if (maxCylinder > 2) {
    warnings.push(
      `Cilindro elevado (${maxCylinder.toFixed(2)}D). Lentes tóricas de alta qualidade recomendadas.`
    );
  }

  // 10. Prism check
  if (od.inducedPrism > 0.5 || os.inducedPrism > 0.5) {
    warnings.push(
      `Prisma induzido pela descentração: OD ${od.inducedPrism.toFixed(2)}Δ, OE ${os.inducedPrism.toFixed(2)}Δ. Verifique tolerância do paciente.`
    );
  }

  // 11. Lab summary
  const labSummary = generateLabSummary(
    prescription,
    face,
    frame,
    od,
    os,
    lensType,
    refractiveIndex,
    treatments,
    minimumBlankSize,
    decentration
  );

  return {
    od,
    os,
    lensType,
    refractiveIndex,
    treatments,
    minimumBlankSize: Math.ceil(minimumBlankSize),
    decentration: Math.round(decentration * 10) / 10,
    warnings,
    labSummary,
  };
}

// ------------------------------------------
// Helper Functions
// ------------------------------------------

function determineLensType(rx: Prescription): LensType {
  const hasAddition = rx.od.addition > 0 || rx.os.addition > 0;

  if (!hasAddition) return "visao-simples";

  const maxAddition = Math.max(rx.od.addition, rx.os.addition);

  if (maxAddition <= 1.5) return "progressivo";
  if (maxAddition <= 2.5) return "progressivo";
  // For very high additions, bifocal may be more comfortable
  return "progressivo";
}

function determineRefractiveIndex(maxSphere: number): RefractiveIndex {
  if (maxSphere <= 2) {
    return {
      value: 1.5,
      name: "CR-39 Standard",
      reason: "Grau baixo — lente padrão oferece boa relação custo-benefício",
    };
  }
  if (maxSphere <= 4) {
    return {
      value: 1.59,
      name: "Policarbonato",
      reason:
        "Grau moderado — policarbonato oferece leveza e resistência a impacto",
    };
  }
  if (maxSphere <= 6) {
    return {
      value: 1.67,
      name: "Alto Índice 1.67",
      reason: "Grau elevado — alto índice reduz espessura significativamente",
    };
  }
  return {
    value: 1.74,
    name: "Ultra Alto Índice 1.74",
    reason:
      "Grau muito elevado — índice 1.74 proporciona a lente mais fina possível",
  };
}

function calculateEyeParams(
  eye: PrescriptionEye,
  dnp: number,
  ocHeight: number,
  frame: FrameSpecs,
  decentration: number,
  refractiveIndex: number,
  lensType: LensType
): EyeCalibration {
  // Spherical equivalent
  const sphericalEquivalent = eye.sphere + eye.cylinder / 2;

  // Optical center horizontal offset from lens center
  const opticalCenterH = decentration;

  // Optical center vertical (from bottom of lens)
  let fittingHeight: number;
  if (lensType === "progressivo") {
    // For progressives, fitting height = OC height (cross at pupil center)
    fittingHeight = ocHeight;
  } else if (lensType === "bifocal") {
    // For bifocals, segment top at lower pupil border
    fittingHeight = ocHeight - 2;
  } else {
    // For single vision, OC at pupil height
    fittingHeight = ocHeight;
  }

  const opticalCenterV = fittingHeight;

  // Estimated thickness (simplified Lensmaker's equation)
  let estimatedEdgeThickness = MIN_EDGE_THICKNESS;
  let estimatedCenterThickness = MIN_CENTER_THICKNESS;

  if (eye.sphere < 0) {
    // Negative lens: thin center, thick edge
    estimatedCenterThickness = MIN_CENTER_THICKNESS;
    estimatedEdgeThickness =
      MIN_CENTER_THICKNESS +
      ((Math.abs(eye.sphere) * frame.lensWidth) /
        (2 * (refractiveIndex - 1) * 1000)) *
        frame.lensWidth;
    // Simplified: edge ≈ center + |power| * (semi-diameter²) / (2000 * (n-1))
    const semiDiameter = frame.lensWidth / 2 + Math.abs(decentration);
    estimatedEdgeThickness =
      MIN_CENTER_THICKNESS +
      (Math.abs(eye.sphere) * semiDiameter * semiDiameter) /
        (2000 * (refractiveIndex - 1));
  } else if (eye.sphere > 0) {
    // Positive lens: thick center, thin edge
    estimatedEdgeThickness = MIN_EDGE_THICKNESS;
    const semiDiameter = frame.lensWidth / 2 + Math.abs(decentration);
    estimatedCenterThickness =
      MIN_EDGE_THICKNESS +
      (eye.sphere * semiDiameter * semiDiameter) /
        (2000 * (refractiveIndex - 1));
  }

  // Induced prism (Prentice's rule): P = c * F
  // c = decentration in cm, F = power in diopters
  const inducedPrism =
    (Math.abs(decentration) / 10) * Math.abs(sphericalEquivalent);

  return {
    sphericalEquivalent: Math.round(sphericalEquivalent * 100) / 100,
    opticalCenterH: Math.round(opticalCenterH * 10) / 10,
    opticalCenterV: Math.round(opticalCenterV * 10) / 10,
    estimatedEdgeThickness: Math.round(estimatedEdgeThickness * 10) / 10,
    estimatedCenterThickness: Math.round(estimatedCenterThickness * 10) / 10,
    inducedPrism: Math.round(inducedPrism * 100) / 100,
    fittingHeight: Math.round(fittingHeight),
  };
}

function calculateEffectiveDiameter(frame: FrameSpecs): number {
  // ED ≈ diagonal of the lens shape
  return Math.sqrt(
    frame.lensWidth * frame.lensWidth + frame.lensHeight * frame.lensHeight
  );
}

function recommendTreatments(
  rx: Prescription,
  lensType: LensType
): Treatment[] {
  const treatments: Treatment[] = [];

  // Antireflexo — always essential
  treatments.push({
    name: "Antirreflexo",
    reason: "Reduz reflexos, melhora nitidez e conforto visual",
    priority: "essencial",
  });

  // UV protection
  treatments.push({
    name: "Proteção UV 400",
    reason: "Bloqueia 100% dos raios UV nocivos",
    priority: "essencial",
  });

  // Blue light filter
  treatments.push({
    name: "Filtro de Luz Azul",
    reason: "Reduz fadiga visual causada por telas digitais",
    priority: "recomendado",
  });

  // Hydrophobic
  treatments.push({
    name: "Hidrofóbico",
    reason: "Repele água e facilita limpeza",
    priority: "recomendado",
  });

  // Photochromic — if no addition (not for progressives with addition)
  if (lensType === "visao-simples") {
    treatments.push({
      name: "Fotocromático",
      reason:
        "Escurece automaticamente ao ar livre, elimina necessidade de óculos de sol separado",
      priority: "opcional",
    });
  }

  // Anti-scratch — for high index lenses
  const maxSphere = Math.max(Math.abs(rx.od.sphere), Math.abs(rx.os.sphere));
  if (maxSphere > 4) {
    treatments.push({
      name: "Anti-risco Reforçado",
      reason: "Lentes de alto índice são mais suscetíveis a riscos",
      priority: "recomendado",
    });
  }

  return treatments;
}

function generateLabSummary(
  rx: Prescription,
  face: FacialMeasurements,
  frame: FrameSpecs,
  od: EyeCalibration,
  os: EyeCalibration,
  lensType: LensType,
  refractiveIndex: RefractiveIndex,
  treatments: Treatment[],
  mbs: number,
  decentration: number
): string {
  const lensTypeLabel: Record<LensType, string> = {
    "visao-simples": "Visão Simples",
    bifocal: "Bifocal",
    progressivo: "Progressivo",
    ocupacional: "Ocupacional",
  };

  const essentialTreatments = treatments
    .filter((t) => t.priority === "essencial" || t.priority === "recomendado")
    .map((t) => t.name)
    .join(", ");

  return [
    "═══ RELATÓRIO DE CALIBRAGEM — OCCHIALE ═══",
    "",
    "▸ RECEITA",
    `  OD: ${formatRx(rx.od)}`,
    `  OE: ${formatRx(rx.os)}`,
    "",
    "▸ MEDIDAS DO PACIENTE",
    `  DP: ${face.pd}mm | DNP OD: ${face.dnpRight}mm | DNP OE: ${face.dnpLeft}mm`,
    `  Altura pupilar: ${face.ocHeight ?? "não informada"}mm`,
    "",
    "▸ ARMAÇÃO",
    `  Lente: ${frame.lensWidth}mm | Ponte: ${frame.bridgeWidth}mm | Haste: ${frame.templeLength}mm | Altura: ${frame.lensHeight}mm`,
    `  Frame PD: ${frame.lensWidth + frame.bridgeWidth}mm`,
    "",
    "▸ PARÂMETROS DE MONTAGEM",
    `  Tipo: ${lensTypeLabel[lensType]}`,
    `  Índice: ${refractiveIndex.value} (${refractiveIndex.name})`,
    `  Descentração: ${decentration.toFixed(1)}mm`,
    `  MBS (Minimum Blank Size): ${Math.ceil(mbs)}mm`,
    "",
    `  OD — Centro óptico: H${od.opticalCenterH > 0 ? "+" : ""}${od.opticalCenterH}mm / V${od.opticalCenterV}mm | Altura montagem: ${od.fittingHeight}mm`,
    `  OE — Centro óptico: H${os.opticalCenterH > 0 ? "+" : ""}${os.opticalCenterH}mm / V${os.opticalCenterV}mm | Altura montagem: ${os.fittingHeight}mm`,
    "",
    "▸ ESPESSURA ESTIMADA",
    `  OD — Centro: ${od.estimatedCenterThickness}mm | Borda: ${od.estimatedEdgeThickness}mm`,
    `  OE — Centro: ${os.estimatedCenterThickness}mm | Borda: ${os.estimatedEdgeThickness}mm`,
    "",
    "▸ TRATAMENTOS",
    `  ${essentialTreatments}`,
    "",
    "═══════════════════════════════════════════",
  ].join("\n");
}

function formatRx(eye: PrescriptionEye): string {
  const parts = [`Esf ${eye.sphere >= 0 ? "+" : ""}${eye.sphere.toFixed(2)}`];
  if (eye.cylinder !== 0) {
    parts.push(`Cil ${eye.cylinder.toFixed(2)} Eixo ${eye.axis}°`);
  }
  if (eye.addition > 0) {
    parts.push(`Ad +${eye.addition.toFixed(2)}`);
  }
  return parts.join(" | ");
}
