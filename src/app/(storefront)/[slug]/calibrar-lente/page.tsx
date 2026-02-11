"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PrescriptionEye {
  sphere: number;
  cylinder: number;
  axis: number;
  addition: number;
}

interface CalibrationResult {
  od: {
    sphericalEquivalent: number;
    opticalCenterH: number;
    opticalCenterV: number;
    estimatedEdgeThickness: number;
    estimatedCenterThickness: number;
    inducedPrism: number;
    fittingHeight: number;
  };
  os: {
    sphericalEquivalent: number;
    opticalCenterH: number;
    opticalCenterV: number;
    estimatedEdgeThickness: number;
    estimatedCenterThickness: number;
    inducedPrism: number;
    fittingHeight: number;
  };
  lensType: string;
  refractiveIndex: { value: number; name: string; reason: string };
  treatments: { name: string; reason: string; priority: string }[];
  minimumBlankSize: number;
  decentration: number;
  warnings: string[];
  labSummary: string;
}

type Step = "prescription" | "measurements" | "calculating" | "result";

export default function CalibrarLentePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>("prescription");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalibrationResult | null>(null);

  // Prescription state
  const [odSphere, setOdSphere] = useState("0.00");
  const [odCylinder, setOdCylinder] = useState("0.00");
  const [odAxis, setOdAxis] = useState("0");
  const [odAddition, setOdAddition] = useState("0.00");
  const [osSphere, setOsSphere] = useState("0.00");
  const [osCylinder, setOsCylinder] = useState("0.00");
  const [osAxis, setOsAxis] = useState("0");
  const [osAddition, setOsAddition] = useState("0.00");

  // Face measurements state
  const [pd, setPd] = useState("");
  const [dnpRight, setDnpRight] = useState("");
  const [dnpLeft, setDnpLeft] = useState("");
  const [ocHeight, setOcHeight] = useState("");

  // Frame specs state
  const [lensWidth, setLensWidth] = useState("");
  const [lensHeight, setLensHeight] = useState("");
  const [bridgeWidth, setBridgeWidth] = useState("");
  const [templeLength, setTempleLength] = useState("140");

  // -----------------------------------------------
  // Calculate
  // -----------------------------------------------
  async function handleCalculate() {
    setError(null);

    // Validate
    if (!pd || !dnpRight || !dnpLeft) {
      setError("Preencha as medidas faciais (DP, DNP direito e esquerdo).");
      return;
    }
    if (!lensWidth || !lensHeight || !bridgeWidth) {
      setError("Preencha as medidas da armação (largura, altura e ponte).");
      return;
    }

    setStep("calculating");

    try {
      const response = await fetch("/api/ai/lens-calibration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescription: {
            od: {
              sphere: parseFloat(odSphere) || 0,
              cylinder: parseFloat(odCylinder) || 0,
              axis: parseInt(odAxis) || 0,
              addition: parseFloat(odAddition) || 0,
            },
            os: {
              sphere: parseFloat(osSphere) || 0,
              cylinder: parseFloat(osCylinder) || 0,
              axis: parseInt(osAxis) || 0,
              addition: parseFloat(osAddition) || 0,
            },
          },
          face: {
            pd: parseFloat(pd),
            dnpRight: parseFloat(dnpRight),
            dnpLeft: parseFloat(dnpLeft),
            ocHeight: ocHeight ? parseFloat(ocHeight) : undefined,
          },
          frame: {
            lensWidth: parseFloat(lensWidth),
            lensHeight: parseFloat(lensHeight),
            bridgeWidth: parseFloat(bridgeWidth),
            templeLength: parseFloat(templeLength) || 140,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao calcular calibragem.");
        setStep("measurements");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setStep("measurements");
    }
  }

  // -----------------------------------------------
  // Lens type labels
  // -----------------------------------------------
  const lensTypeLabels: Record<string, string> = {
    "visao-simples": "Visão Simples",
    bifocal: "Bifocal",
    progressivo: "Progressivo",
    ocupacional: "Ocupacional",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Calculadora de Calibragem de Lentes
        </h1>
        <p className="mt-2 text-text-secondary">
          Insira sua receita e medidas para calcular os parâmetros exatos de
          montagem das suas lentes.
        </p>
      </div>

      {/* Step: Prescription */}
      {(step === "prescription" || step === "measurements") && (
        <div className="space-y-6">
          {/* Prescription */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Receita (Prescrição)
            </h2>
            <p className="mt-1 text-xs text-text-tertiary">
              Insira os valores da sua receita oftalmológica. Valores negativos
              indicam miopia.
            </p>

            {/* OD */}
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary">
                OD (Olho Direito)
              </p>
              <div className="mt-2 grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary">Esférico</label>
                  <input
                    type="number"
                    step="0.25"
                    value={odSphere}
                    onChange={(e) => setOdSphere(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">
                    Cilíndrico
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={odCylinder}
                    onChange={(e) => setOdCylinder(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">
                    Eixo (0-180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={odAxis}
                    onChange={(e) => setOdAxis(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">Adição</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={odAddition}
                    onChange={(e) => setOdAddition(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* OS */}
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary">
                OE (Olho Esquerdo)
              </p>
              <div className="mt-2 grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary">Esférico</label>
                  <input
                    type="number"
                    step="0.25"
                    value={osSphere}
                    onChange={(e) => setOsSphere(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">
                    Cilíndrico
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={osCylinder}
                    onChange={(e) => setOsCylinder(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">
                    Eixo (0-180)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={osAxis}
                    onChange={(e) => setOsAxis(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary">Adição</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={osAddition}
                    onChange={(e) => setOsAddition(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Face Measurements */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Medidas Faciais
            </h2>
            <p className="mt-1 text-xs text-text-tertiary">
              Se você já fez a medição facial com IA, use os valores obtidos.
              Caso contrário, peça ao seu óptico.
            </p>
            <Link
              href={`/${slug}/medir-rosto`}
              className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
            >
              Ainda não tem? Medir rosto com IA →
            </Link>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs text-text-tertiary">
                  DP Total (mm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pd}
                  onChange={(e) => setPd(e.target.value)}
                  placeholder="63"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">
                  DNP Direito (mm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dnpRight}
                  onChange={(e) => setDnpRight(e.target.value)}
                  placeholder="31.5"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">
                  DNP Esquerdo (mm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dnpLeft}
                  onChange={(e) => setDnpLeft(e.target.value)}
                  placeholder="31.5"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">
                  Altura Pupilar (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={ocHeight}
                  onChange={(e) => setOcHeight(e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Frame Specs */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Armação Escolhida
            </h2>
            <p className="mt-1 text-xs text-text-tertiary">
              Medidas da armação (geralmente impressas na haste interna, ex:
              54□17-140).
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-xs text-text-tertiary">
                  Largura Lente (mm) *
                </label>
                <input
                  type="number"
                  value={lensWidth}
                  onChange={(e) => setLensWidth(e.target.value)}
                  placeholder="54"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">
                  Altura Lente (mm) *
                </label>
                <input
                  type="number"
                  value={lensHeight}
                  onChange={(e) => setLensHeight(e.target.value)}
                  placeholder="40"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">
                  Ponte (mm) *
                </label>
                <input
                  type="number"
                  value={bridgeWidth}
                  onChange={(e) => setBridgeWidth(e.target.value)}
                  placeholder="17"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">Haste (mm)</label>
                <input
                  type="number"
                  value={templeLength}
                  onChange={(e) => setTempleLength(e.target.value)}
                  placeholder="140"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full rounded-xl bg-brand-600 px-6 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Calcular Calibragem
          </button>
        </div>
      )}

      {/* Step: Calculating */}
      {step === "calculating" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-lg font-semibold text-text-primary">
            Calculando parâmetros de calibragem...
          </p>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
              Calibragem calculada com sucesso!
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">Resumo</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {lensTypeLabels[result.lensType] ?? result.lensType}
                </p>
                <p className="text-xs text-text-tertiary">Tipo de Lente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {result.refractiveIndex.value}
                </p>
                <p className="text-xs text-text-tertiary">Índice de Refração</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {result.minimumBlankSize}mm
                </p>
                <p className="text-xs text-text-tertiary">Blank Mínimo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {result.decentration}mm
                </p>
                <p className="text-xs text-text-tertiary">Descentração</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-text-tertiary">
              {result.refractiveIndex.reason}
            </p>
          </div>

          {/* Per-eye details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(["od", "os"] as const).map((eye) => {
              const data = result[eye];
              return (
                <div
                  key={eye}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <h3 className="text-sm font-semibold text-text-primary">
                    {eye === "od" ? "OD (Olho Direito)" : "OE (Olho Esquerdo)"}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Equiv. Esférico
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.sphericalEquivalent >= 0 ? "+" : ""}
                        {data.sphericalEquivalent.toFixed(2)}D
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Centro Óptico H
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.opticalCenterH > 0 ? "+" : ""}
                        {data.opticalCenterH}mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Altura Montagem
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.fittingHeight}mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Espessura Centro
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.estimatedCenterThickness}mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Espessura Borda
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.estimatedEdgeThickness}mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">
                        Prisma Induzido
                      </span>
                      <span className="font-medium text-text-primary">
                        {data.inducedPrism.toFixed(2)}Δ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Treatments */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Tratamentos Recomendados
            </h2>
            <div className="mt-4 space-y-3">
              {result.treatments.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.priority === "essencial"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : t.priority === "recomendado"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Alertas:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lab Summary */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Relatório para o Laboratório
            </h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-xs text-text-primary dark:bg-gray-900">
              {result.labSummary}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.labSummary);
              }}
              className="mt-3 rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Copiar Relatório
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("prescription");
                setResult(null);
              }}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Calcular Novamente
            </button>
            <Link
              href={`/${slug}`}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
