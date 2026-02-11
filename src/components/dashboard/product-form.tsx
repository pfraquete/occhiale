"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations/product";
import type { z } from "zod";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/products";

type ProductFormValues = z.input<typeof productSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const categoryOptions = [
  { value: "oculos-grau", label: "Óculos de Grau" },
  { value: "oculos-sol", label: "Óculos de Sol" },
  { value: "lentes-contato", label: "Lentes de Contato" },
  { value: "acessorios", label: "Acessórios" },
  { value: "infantil", label: "Infantil" },
];

interface ProductFormProps {
  storeId: string;
  product?: {
    id: string;
    name: string;
    description_seo: string;
    price: number;
    compare_price: number | null;
    category: string;
    brand: string;
    sku: string | null;
    images: string[] | null;
    specs: Record<string, unknown> | null;
    stock_qty: number;
    is_active: boolean;
  };
}

export function ProductForm({ storeId, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      descriptionSeo: product?.description_seo ?? "",
      price: product?.price ?? 0,
      comparePrice: product?.compare_price ?? undefined,
      category:
        (product?.category as ProductFormValues["category"]) ?? "oculos-grau",
      brand: product?.brand ?? "",
      sku: product?.sku ?? "",
      images: product?.images ?? [],
      specs: {
        frameShape: (product?.specs as Record<string, unknown>)
          ?.frameShape as ProductFormValues["specs"]["frameShape"],
        frameMaterial: (product?.specs as Record<string, unknown>)
          ?.frameMaterial as ProductFormValues["specs"]["frameMaterial"],
        frameColor:
          ((product?.specs as Record<string, unknown>)?.frameColor as string) ??
          "",
        lensWidth:
          ((product?.specs as Record<string, unknown>)?.lensWidth as number) ??
          undefined,
        bridgeWidth:
          ((product?.specs as Record<string, unknown>)
            ?.bridgeWidth as number) ?? undefined,
        templeLength:
          ((product?.specs as Record<string, unknown>)
            ?.templeLength as number) ?? undefined,
      },
      stockQty: product?.stock_qty ?? 0,
      isActive: product?.is_active ?? true,
    },
  });

  const isActive = watch("isActive");

  function onSubmit(data: ProductFormValues) {
    setServerError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateProductAction(
            product.id,
            data as unknown as Record<string, unknown>
          )
        : await createProductAction(
            storeId,
            data as unknown as Record<string, unknown>
          );

      if (!result.success) {
        setServerError(result.error ?? "Erro desconhecido");
      } else {
        router.push("/dashboard/produtos");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic info */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text-primary">
          Informações Básicas
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome do produto *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Ray-Ban Aviator Classic"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="brand">Marca *</Label>
            <Input
              id="brand"
              {...register("brand")}
              placeholder="Ex: Ray-Ban"
            />
            {errors.brand && (
              <p className="mt-1 text-xs text-danger">{errors.brand.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <select
              id="category"
              {...register("category")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} placeholder="Ex: RB3025-001" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="descriptionSeo">Descrição *</Label>
            <Textarea
              id="descriptionSeo"
              {...register("descriptionSeo")}
              rows={4}
              placeholder="Descrição completa do produto para SEO..."
            />
            {errors.descriptionSeo && (
              <p className="mt-1 text-xs text-danger">
                {errors.descriptionSeo.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text-primary">Preço</h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Valores em centavos (ex: 15990 = R$ 159,90)
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Preço (centavos) *</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="15990"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-danger">{errors.price.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="comparePrice">Preço comparação (centavos)</Label>
            <Input
              id="comparePrice"
              type="number"
              {...register("comparePrice", { valueAsNumber: true })}
              placeholder="19990"
            />
          </div>
          <div>
            <Label htmlFor="stockQty">Estoque *</Label>
            <Input
              id="stockQty"
              type="number"
              {...register("stockQty", { valueAsNumber: true })}
              placeholder="10"
            />
            {errors.stockQty && (
              <p className="mt-1 text-xs text-danger">
                {errors.stockQty.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text-primary">
          Especificações Ópticas
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Campos opcionais para óculos e armações.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="frameShape">Formato</Label>
            <select
              id="frameShape"
              {...register("specs.frameShape")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecionar...</option>
              <option value="redondo">Redondo</option>
              <option value="quadrado">Quadrado</option>
              <option value="retangular">Retangular</option>
              <option value="aviador">Aviador</option>
              <option value="gatinho">Gatinho</option>
              <option value="oval">Oval</option>
              <option value="hexagonal">Hexagonal</option>
              <option value="clubmaster">Clubmaster</option>
            </select>
          </div>
          <div>
            <Label htmlFor="frameMaterial">Material</Label>
            <select
              id="frameMaterial"
              {...register("specs.frameMaterial")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecionar...</option>
              <option value="acetato">Acetato</option>
              <option value="metal">Metal</option>
              <option value="titanio">Titânio</option>
              <option value="misto">Misto</option>
              <option value="nylon">Nylon</option>
            </select>
          </div>
          <div>
            <Label htmlFor="frameColor">Cor da armação</Label>
            <Input
              id="frameColor"
              {...register("specs.frameColor")}
              placeholder="Ex: Preto"
            />
          </div>
          <div>
            <Label htmlFor="lensWidth">Largura lente (mm)</Label>
            <Input
              id="lensWidth"
              type="number"
              {...register("specs.lensWidth", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="bridgeWidth">Ponte (mm)</Label>
            <Input
              id="bridgeWidth"
              type="number"
              {...register("specs.bridgeWidth", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="templeLength">Haste (mm)</Label>
            <Input
              id="templeLength"
              type="number"
              {...register("specs.templeLength", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text-primary">Imagens</h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Insira URLs das imagens (uma por linha). Upload será disponível em
          breve.
        </p>
        <div className="mt-4">
          <Textarea
            rows={3}
            placeholder={
              "https://exemplo.com/imagem1.jpg\nhttps://exemplo.com/imagem2.jpg"
            }
            defaultValue={product?.images?.join("\n") ?? ""}
            onChange={(e) => {
              const urls = e.target.value
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean);
              setValue("images", urls);
            }}
          />
          {errors.images && (
            <p className="mt-1 text-xs text-danger">{errors.images.message}</p>
          )}
        </div>
      </div>

      {/* Status + submit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
          <span className="text-sm text-text-secondary">
            {isActive
              ? "Produto ativo no catálogo"
              : "Produto inativo (oculto)"}
          </span>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : isEditing
                ? "Salvar Alterações"
                : "Criar Produto"}
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      )}
    </form>
  );
}
