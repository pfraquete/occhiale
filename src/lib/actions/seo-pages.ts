"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

// ------------------------------------------
// Types
// ------------------------------------------

export interface SeoPage {
  id: string;
  store_id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content_html: string | null;
  schema_json: Record<string, unknown> | null;
  page_type: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

const PAGE_TYPES = ["category", "brand", "guide", "blog", "landing"] as const;

// ------------------------------------------
// Auth Helper
// ------------------------------------------

async function authorizeStore(storeId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("store_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return null;
  }

  return user.id;
}

// ------------------------------------------
// List SEO Pages
// ------------------------------------------

export async function listSeoPagesAction(
  storeId: string
): Promise<ActionResult<SeoPage[]>> {
  const userId = await authorizeStore(storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as SeoPage[] };
}

// ------------------------------------------
// Get Single SEO Page
// ------------------------------------------

export async function getSeoPageAction(
  storeId: string,
  pageId: string
): Promise<ActionResult<SeoPage>> {
  const userId = await authorizeStore(storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("id", pageId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Página não encontrada" };
  }

  return { success: true, data: data as SeoPage };
}

// ------------------------------------------
// Create SEO Page
// ------------------------------------------

interface CreateSeoPageInput {
  storeId: string;
  slug: string;
  title: string;
  metaDescription?: string;
  contentHtml?: string;
  pageType: string;
  isPublished?: boolean;
}

export async function createSeoPageAction(
  input: CreateSeoPageInput
): Promise<ActionResult<SeoPage>> {
  const userId = await authorizeStore(input.storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  if (!PAGE_TYPES.includes(input.pageType as (typeof PAGE_TYPES)[number])) {
    return { success: false, error: "Tipo de página inválido" };
  }

  if (!input.title || input.title.trim().length < 3) {
    return { success: false, error: "Título deve ter pelo menos 3 caracteres" };
  }

  // Sanitize slug
  const slug = input.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length < 2) {
    return { success: false, error: "Slug deve ter pelo menos 2 caracteres" };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .insert({
      store_id: input.storeId,
      slug,
      title: input.title.trim(),
      meta_description: input.metaDescription?.trim() || null,
      content_html: input.contentHtml || null,
      page_type: input.pageType,
      is_published: input.isPublished ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Já existe uma página com esse slug" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/seo");
  return { success: true, data: data as SeoPage };
}

// ------------------------------------------
// Update SEO Page
// ------------------------------------------

interface UpdateSeoPageInput {
  id: string;
  storeId: string;
  slug?: string;
  title?: string;
  metaDescription?: string | null;
  contentHtml?: string | null;
  pageType?: string;
  isPublished?: boolean;
}

export async function updateSeoPageAction(
  input: UpdateSeoPageInput
): Promise<ActionResult> {
  const userId = await authorizeStore(input.storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) {
    if (input.title.trim().length < 3) {
      return {
        success: false,
        error: "Título deve ter pelo menos 3 caracteres",
      };
    }
    updates.title = input.title.trim();
  }

  if (input.slug !== undefined) {
    const slug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (slug.length < 2) {
      return { success: false, error: "Slug deve ter pelo menos 2 caracteres" };
    }
    updates.slug = slug;
  }

  if (input.metaDescription !== undefined) {
    updates.meta_description = input.metaDescription;
  }

  if (input.contentHtml !== undefined) {
    updates.content_html = input.contentHtml;
  }

  if (input.pageType !== undefined) {
    if (!PAGE_TYPES.includes(input.pageType as (typeof PAGE_TYPES)[number])) {
      return { success: false, error: "Tipo de página inválido" };
    }
    updates.page_type = input.pageType;
  }

  if (input.isPublished !== undefined) {
    updates.is_published = input.isPublished;
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "Nenhum campo para atualizar" };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("seo_pages")
    .update(updates)
    .eq("id", input.id)
    .eq("store_id", input.storeId);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Já existe uma página com esse slug" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/seo");
  return { success: true };
}

// ------------------------------------------
// Delete SEO Page
// ------------------------------------------

export async function deleteSeoPageAction(
  storeId: string,
  pageId: string
): Promise<ActionResult> {
  const userId = await authorizeStore(storeId);
  if (!userId) {
    return { success: false, error: "Não autorizado" };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("seo_pages")
    .delete()
    .eq("id", pageId)
    .eq("store_id", storeId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/seo");
  return { success: true };
}
