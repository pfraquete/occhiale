"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
        Erro
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-text-primary">
        Algo deu errado
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        Ocorreu um erro inesperado. Nossa equipe foi notificada. Tente novamente
        ou volte mais tarde.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-text-tertiary">
          Código: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-secondary"
        >
          Voltar ao início
        </Link>
      </div>
      <p className="mt-12 text-xs text-text-tertiary">
        OCCHIALE — Plataforma Inteligente para Óticas
      </p>
    </div>
  );
}
