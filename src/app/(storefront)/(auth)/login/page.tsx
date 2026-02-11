"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (redirect) formData.set("redirect", redirect);

    const result = await loginAction(formData);
    if (!result.success) {
      setError(result.error ?? "Erro ao entrar");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Entrar
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Acesse sua conta para acompanhar pedidos
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Não tem conta?{" "}
        <Link
          href={`/cadastro${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Criar conta
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-text-tertiary">
          Carregando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
