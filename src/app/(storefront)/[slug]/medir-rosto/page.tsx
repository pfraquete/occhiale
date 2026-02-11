"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface FaceMeasurements {
  pd: number;
  pdRight: number;
  pdLeft: number;
  dnpRight: number;
  dnpLeft: number;
  faceWidth: number;
  faceShape: string;
  noseWidth: number;
  templeWidth: number;
  recommendedFrameWidth: { min: number; max: number };
  recommendedBridge: { min: number; max: number };
  recommendedTemple: { min: number; max: number };
  confidence: string;
}

interface FrameRecommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  score: number;
  reasons: string[];
}

type Step = "intro" | "capture" | "analyzing" | "results" | "recommendations";

export default function MedirRostoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>("intro");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<FaceMeasurements | null>(
    null
  );
  const [recommendations, setRecommendations] = useState<FrameRecommendation[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------
  // Handle photo upload
  // -----------------------------------------------
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem (JPG, PNG, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 10MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setStep("capture");
    setError(null);
  }

  // -----------------------------------------------
  // Analyze face photo
  // -----------------------------------------------
  async function handleAnalyze() {
    if (!imagePreview) return;

    setStep("analyzing");
    setError(null);

    try {
      // For the face measurement API, we need a URL.
      // In production, upload to Supabase Storage first.
      // For now, we send the base64 data URL.
      const response = await fetch("/api/ai/face-measurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imagePreview }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao analisar foto.");
        setStep("capture");
        return;
      }

      setMeasurements(data.measurements);
      setWarnings(data.warnings ?? []);
      setStep("results");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setStep("capture");
    }
  }

  // -----------------------------------------------
  // Get frame recommendations
  // -----------------------------------------------
  async function handleGetRecommendations() {
    if (!measurements) return;

    try {
      const response = await fetch("/api/ai/match-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: slug,
          measurements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao buscar recomendações.");
        return;
      }

      setRecommendations(data.recommendations ?? []);
      setStep("recommendations");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  // -----------------------------------------------
  // Format price
  // -----------------------------------------------
  function formatPrice(cents: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  }

  // -----------------------------------------------
  // Face shape label
  // -----------------------------------------------
  const faceShapeLabels: Record<string, string> = {
    oval: "Oval",
    redondo: "Redondo",
    quadrado: "Quadrado",
    coracao: "Coração",
    oblongo: "Oblongo",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Medição Facial com IA
        </h1>
        <p className="mt-2 text-text-secondary">
          Envie uma foto do seu rosto e nossa IA vai medir suas proporções
          faciais para recomendar as armações ideais para você.
        </p>
      </div>

      {/* Step: Intro */}
      {step === "intro" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Como funciona?
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  1
                </span>
                <span>
                  <strong>Tire uma foto</strong> — Olhe diretamente para a
                  câmera, mantenha o rosto reto e bem iluminado.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  2
                </span>
                <span>
                  <strong>IA analisa</strong> — Nossa inteligência artificial
                  mede distância pupilar (DP), formato do rosto, largura facial
                  e proporções.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  3
                </span>
                <span>
                  <strong>Recomendações</strong> — Receba sugestões
                  personalizadas de armações que combinam com seu rosto.
                </span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <strong>Dicas para uma boa foto:</strong>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Olhe diretamente para a câmera</li>
              <li>Mantenha o rosto reto (sem inclinar)</li>
              <li>Boa iluminação frontal (sem sombras fortes)</li>
              <li>Remova óculos, se estiver usando</li>
              <li>
                Segure um cartão de crédito na testa para referência de escala
                (opcional, melhora a precisão)
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl bg-brand-600 px-6 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Tirar Foto ou Enviar Imagem
            </button>
          </div>
        </div>
      )}

      {/* Step: Capture (photo selected, confirm) */}
      {step === "capture" && imagePreview && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border">
            <Image
              src={imagePreview}
              alt="Sua foto"
              width={600}
              height={600}
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setImagePreview(null);
                setStep("intro");
              }}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Tirar Outra
            </button>
            <button
              onClick={handleAnalyze}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Analisar com IA
            </button>
          </div>
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">
              Analisando seu rosto...
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Nossa IA está medindo suas proporções faciais. Isso leva alguns
              segundos.
            </p>
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === "results" && measurements && (
        <div className="space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
              Análise concluída!
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Confiança:{" "}
              {measurements.confidence === "high"
                ? "Alta"
                : measurements.confidence === "medium"
                  ? "Média"
                  : "Baixa"}
            </p>
          </div>

          {/* Measurements table */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Suas Medidas
            </h2>
            <div className="mt-4 divide-y divide-border">
              <MeasurementRow
                label="Formato do rosto"
                value={
                  faceShapeLabels[measurements.faceShape] ??
                  measurements.faceShape
                }
              />
              <MeasurementRow
                label="Distância Pupilar (DP)"
                value={`${measurements.pd} mm`}
                detail="Distância entre o centro das duas pupilas"
              />
              <MeasurementRow
                label="DNP Direito"
                value={`${measurements.dnpRight} mm`}
                detail="Distância nasopupilar do olho direito"
              />
              <MeasurementRow
                label="DNP Esquerdo"
                value={`${measurements.dnpLeft} mm`}
                detail="Distância nasopupilar do olho esquerdo"
              />
              <MeasurementRow
                label="Largura do rosto"
                value={`${measurements.faceWidth} mm`}
              />
              <MeasurementRow
                label="Largura do nariz"
                value={`${measurements.noseWidth} mm`}
              />
            </div>
          </div>

          {/* Recommended frame specs */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              Armação Ideal para Você
            </h2>
            <div className="mt-4 divide-y divide-border">
              <MeasurementRow
                label="Largura da armação"
                value={`${measurements.recommendedFrameWidth.min}–${measurements.recommendedFrameWidth.max} mm`}
              />
              <MeasurementRow
                label="Ponte (bridge)"
                value={`${measurements.recommendedBridge.min}–${measurements.recommendedBridge.max} mm`}
              />
              <MeasurementRow
                label="Haste (temple)"
                value={`${measurements.recommendedTemple.min}–${measurements.recommendedTemple.max} mm`}
              />
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Observações:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep("intro");
                setImagePreview(null);
                setMeasurements(null);
              }}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Medir Novamente
            </button>
            <button
              onClick={handleGetRecommendations}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ver Armações Recomendadas
            </button>
          </div>
        </div>
      )}

      {/* Step: Recommendations */}
      {step === "recommendations" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-primary">
              Armações Recomendadas para Você
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Baseado nas suas medidas faciais, estas são as melhores opções:
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-text-secondary">
                Nenhuma armação encontrada com as especificações ideais para o
                seu rosto. Visite nossa loja para um atendimento personalizado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Link
                  key={rec.id}
                  href={`/${slug}/produto/${rec.id}`}
                  className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                >
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {rec.images[0] ? (
                        <Image
                          src={rec.images[0]}
                          alt={rec.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Sem foto
                        </div>
                      )}
                      {index < 3 && (
                        <span className="absolute left-1 top-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {rec.name}
                      </p>
                      <p className="text-xs text-text-tertiary">{rec.brand}</p>
                      <p className="mt-1 text-sm font-bold text-brand-600">
                        {formatPrice(rec.price)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rec.reasons.slice(0, 3).map((reason, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-brand-600">
                        {Math.round(rec.score * 100)}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("results")}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
            >
              Voltar às Medidas
            </button>
            <Link
              href={`/${slug}`}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ver Catálogo Completo
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

// -----------------------------------------------
// Measurement Row Component
// -----------------------------------------------
function MeasurementRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {detail && <p className="text-xs text-text-tertiary">{detail}</p>}
      </div>
      <p className="text-sm font-semibold text-brand-600">{value}</p>
    </div>
  );
}
