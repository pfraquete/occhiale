"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/modules/core/auth/actions/auth";
import { Mail } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPasswordAction(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Erro ao enviar e-mail");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
          E-mail enviado!
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Verifique sua caixa de entrada para redefinir a senha.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Voltar para login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Recuperar Senha
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enviaremos um link para redefinir sua senha
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
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
