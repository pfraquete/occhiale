"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "occhiale_cookie_consent";

type ConsentLevel = "essential" | "analytics" | "marketing";

interface ConsentState {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Small delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const saveConsent = (levels: ConsentLevel[]) => {
    const consent: ConsentState = {
      essential: true,
      analytics: levels.includes("analytics"),
      marketing: levels.includes("marketing"),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);

    // Dispatch event so analytics can initialize
    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: consent })
    );
  };

  const handleAcceptAll = () => {
    saveConsent(["essential", "analytics", "marketing"]);
  };

  const handleAcceptEssential = () => {
    saveConsent(["essential"]);
  };

  const handleSavePreferences = () => {
    const levels: ConsentLevel[] = ["essential"];
    if (analytics) levels.push("analytics");
    if (marketing) levels.push("marketing");
    saveConsent(levels);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            Privacidade e Cookies
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Utilizamos cookies para melhorar sua experiência, analisar o tráfego
            do site e personalizar conteúdo. Em conformidade com a{" "}
            <strong>LGPD (Lei Geral de Proteção de Dados)</strong>, você pode
            escolher quais cookies aceitar.
          </p>
        </div>

        {showDetails && (
          <div className="mb-4 space-y-3 rounded-lg bg-zinc-50 p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded text-zinc-900"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">Essenciais</p>
                <p className="text-xs text-zinc-500">
                  Necessários para o funcionamento do site. Não podem ser
                  desativados.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="rounded text-zinc-900"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">Analytics</p>
                <p className="text-xs text-zinc-500">
                  Nos ajudam a entender como os visitantes interagem com o site.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="rounded text-zinc-900"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">Marketing</p>
                <p className="text-xs text-zinc-500">
                  Utilizados para exibir anúncios relevantes para você.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAcceptAll}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Aceitar Todos
          </button>
          {showDetails ? (
            <button
              onClick={handleSavePreferences}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Salvar Preferências
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Personalizar
            </button>
          )}
          <button
            onClick={handleAcceptEssential}
            className="text-sm text-zinc-500 underline hover:text-zinc-700"
          >
            Apenas essenciais
          </button>
          <Link
            href="/privacidade"
            className="ml-auto text-sm text-zinc-500 underline hover:text-zinc-700"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to check consent status from anywhere.
 */
export function getConsentState(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ConsentState;
  } catch {
    return null;
  }
}
