"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import Image from "next/image";

interface MultiImageUploadProps {
  /** Supabase storage bucket name */
  bucket: "product-images" | "store-assets";
  /** Folder path inside the bucket (usually storeId) */
  folder: string;
  /** Current image URLs */
  value: string[];
  /** Callback when images change */
  onChange: (urls: string[]) => void;
  /** Max number of images */
  maxImages?: number;
  /** Max file size in bytes per image (default: 5MB) */
  maxSize?: number;
  /** Label text */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function MultiImageUpload({
  bucket,
  folder,
  value,
  onChange,
  maxImages = 8,
  maxSize = 5 * 1024 * 1024,
  label = "Imagens",
  disabled = false,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setError(null);

      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        setError(`Máximo de ${maxImages} imagens atingido`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);

      // Validate all files
      for (const file of filesToUpload) {
        if (file.size > maxSize) {
          setError(
            `${file.name} é muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
          );
          return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError(`${file.name}: tipo não permitido`);
          return;
        }
      }

      setUploading(true);

      try {
        const supabase = createClient();
        const newUrls: string[] = [];

        for (const file of filesToUpload) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(fileName);

          newUrls.push(publicUrl);
        }

        onChange([...value, ...newUrls]);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Erro ao fazer upload");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, maxSize, maxImages, value, onChange]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(index: number) {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const newUrls = [...value];
    const temp = newUrls[index]!;
    newUrls[index] = newUrls[index - 1]!;
    newUrls[index - 1] = temp;
    onChange(newUrls);
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}{" "}
          <span className="font-normal text-text-tertiary">
            ({value.length}/{maxImages})
          </span>
        </label>
      )}

      {/* Image grid */}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {value.map((url, index) => (
            <div key={url} className="group relative aspect-square">
              <div className="relative h-full w-full overflow-hidden rounded-lg border border-border">
                <Image
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-600/80 py-0.5 text-center text-[10px] font-medium text-white">
                    Principal
                  </span>
                )}
              </div>
              {!disabled && (
                <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-text-secondary shadow-sm ring-1 ring-border hover:bg-bg-secondary"
                      title="Mover para frente"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxImages && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-4 text-sm text-text-secondary transition-colors hover:border-brand-300 hover:bg-bg-secondary disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Adicionar imagens
            </>
          )}
        </button>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
