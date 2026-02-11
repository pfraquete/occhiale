"use client";
import { useState, useCallback } from "react";
import {
  createSeoPageAction,
  updateSeoPageAction,
  deleteSeoPageAction,
  type SeoPage,
} from "@/lib/actions/seo-pages";

const PAGE_TYPE_LABELS: Record<string, string> = {
  category: "Categoria",
  brand: "Marca",
  guide: "Guia",
  blog: "Blog",
  landing: "Landing Page",
};

interface SeoDashboardProps {
  storeId: string;
  storeSlug: string;
  initialPages: SeoPage[];
}

export function SeoDashboard({
  storeId,
  storeSlug,
  initialPages,
}: SeoDashboardProps) {
  const [pages, setPages] = useState<SeoPage[]>(initialPages);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState("blog");
  const [metaDescription, setMetaDescription] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setSlug("");
    setPageType("blog");
    setMetaDescription("");
    setContentHtml("");
    setIsPublished(false);
    setEditingId(null);
    setShowEditor(false);
    setError("");
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingId) {
      const autoSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let result: { success: boolean; data?: SeoPage | null; error?: string };
    if (editingId) {
      result = await updateSeoPageAction({
        id: editingId,
        storeId,
        title,
        slug,
        pageType,
        metaDescription: metaDescription || null,
        contentHtml: contentHtml || null,
        isPublished,
      });
      if (result.success && result.data) {
        setPages((prev) =>
          prev.map((p) => (p.id === editingId ? result.data! : p))
        );
      }
    } else {
      result = await createSeoPageAction({
        storeId,
        title,
        slug,
        pageType,
        metaDescription: metaDescription || undefined,
        contentHtml: contentHtml || undefined,
        isPublished,
      });
      if (result.success && result.data) {
        setPages((prev) => [result.data!, ...prev]);
      }
    }

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar");
      return;
    }

    resetForm();
  };

  const handleEdit = (page: SeoPage) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setPageType(page.page_type);
    setMetaDescription(page.meta_description ?? "");
    setContentHtml(page.content_html ?? "");
    setIsPublished(page.is_published);
    setShowEditor(true);
  };

  const handleTogglePublish = async (page: SeoPage) => {
    const result = await updateSeoPageAction({
      id: page.id,
      storeId,
      isPublished: !page.is_published,
    });
    if (result.success && result.data) {
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? result.data! : p))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta página?")) return;
    const result = await deleteSeoPageAction(storeId, id);
    if (result.success) {
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Páginas SEO</h1>
          <p className="text-muted-foreground">
            Crie páginas otimizadas para mecanismos de busca.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowEditor(true);
          }}
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nova Página
        </button>
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Editar Página" : "Nova Página"}
          </h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Guia Completo de Lentes Multifocais"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="guia-lentes-multifocais"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
                {storeSlug && slug && (
                  <p className="mt-1 text-xs text-zinc-400">
                    URL: /{storeSlug}/p/{slug}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tipo</label>
                <select
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded"
                  />
                  Publicar imediatamente
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Descrição para mecanismos de busca (até 160 caracteres)"
                rows={2}
                maxLength={160}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-zinc-400">
                {metaDescription.length}/160 caracteres
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Conteúdo (HTML)
              </label>
              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="<h2>Título da seção</h2><p>Conteúdo da página...</p>"
                rows={12}
                className="w-full rounded-md border px-3 py-2 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {pages.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <p className="text-zinc-500">Nenhuma página SEO criada.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Crie páginas de conteúdo para atrair tráfego orgânico.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Título
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{page.title}</p>
                      <p className="text-xs text-zinc-400">/{page.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs">
                      {PAGE_TYPE_LABELS[page.page_type] ?? page.page_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        page.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {page.is_published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(page)}
                        className="rounded border px-2 py-1 text-xs hover:bg-zinc-50"
                      >
                        {page.is_published ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className="rounded border px-2 py-1 text-xs hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
