"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Lock } from "lucide-react";

export default function RedefinirSenhaPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Senhas não conferem");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="mb-6 text-center">
        <Lock className="mx-auto h-10 w-10 text-brand-600" />
        <h1 className="mt-3 font-display text-2xl font-bold text-text-primary">
          Nova Senha
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Defina sua nova senha
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
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Repita a nova senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Redefinir Senha"}
        </button>
      </form>
    </>
  );
}
