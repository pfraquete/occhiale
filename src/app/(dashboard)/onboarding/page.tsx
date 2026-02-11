"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStoreAction, checkSlugAvailability } from "@/lib/actions/store";
import { Store, Loader2, CheckCircle2, XCircle } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced slug availability check (300ms)
  const checkSlugDebounced = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(value);
        setSlugStatus(result.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 300);
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      const newSlug = slugify(value);
      setSlug(newSlug);
      checkSlugDebounced(newSlug);
    }
  }

  function handleSlugChange(value: string) {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);
    setSlug(sanitized);
    setSlugManuallyEdited(true);
    checkSlugDebounced(sanitized);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createStoreAction({
      name,
      slug,
      whatsappNumber: whatsappNumber || undefined,
    });

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao criar loja");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <Store className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Criar sua loja
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Configure as informações básicas para começar a usar o OCCHIALE.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-surface p-6"
        >
          {/* Store Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Nome da Loja *
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Ex: Ótica Visão Clara"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              URL da Loja *
            </label>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-tertiary">
                occhiale.com/
              </span>
              <input
                id="slug"
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full rounded-r-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="minha-otica"
              />
            </div>
            {/* Slug status */}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {slugStatus === "checking" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-text-tertiary" />
                  <span className="text-text-tertiary">Verificando...</span>
                </>
              )}
              {slugStatus === "available" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Disponível!</span>
                </>
              )}
              {slugStatus === "taken" && (
                <>
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">
                    Já em uso. Escolha outro.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label
              htmlFor="whatsapp"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              WhatsApp da Loja{" "}
              <span className="font-normal text-text-tertiary">(opcional)</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="+5511999999999"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Formato: +55 + DDD + número. Você pode configurar depois.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || slugStatus === "taken"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Store className="h-4 w-4" />
                Criar Loja
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
