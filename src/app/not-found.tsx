import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Erro 404
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-text-primary">
        Página não encontrada
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        A página que você está procurando não existe ou foi movida. Verifique o
        endereço e tente novamente.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Voltar ao início
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-secondary"
        >
          Ir ao Dashboard
        </Link>
      </div>
      <p className="mt-12 text-xs text-text-tertiary">
        OCCHIALE — Plataforma Inteligente para Óticas
      </p>
    </div>
  );
}
