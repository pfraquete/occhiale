"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/lib/actions/auth";
import { Eye, EyeOff, UserPlus } from "lucide-react";

function CadastroForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Erro ao criar conta");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Conta criada!
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Verifique seu e-mail para confirmar a conta.
        </p>
        <Link
          href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Ir para login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Criar Conta
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Cadastre-se para acompanhar seus pedidos
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
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Seu nome"
          />
        </div>

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
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Telefone (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="(11) 99999-8888"
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
              minLength={6}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Mínimo 6 caracteres"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Repita a senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Criando..." : "Criar Conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link
          href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-text-tertiary">
          Carregando...
        </div>
      }
    >
      <CadastroForm />
    </Suspense>
  );
}
