"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  /** Supabase storage bucket name */
  bucket: "product-images" | "prescriptions" | "store-assets";
  /** Folder path inside the bucket (usually storeId) */
  folder: string;
  /** Current image URL (for edit mode) */
  value?: string | null;
  /** Callback when image is uploaded or removed */
  onChange: (url: string | null) => void;
  /** Max file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Accepted MIME types */
  accept?: string;
  /** Aspect ratio hint for the preview */
  aspectRatio?: "square" | "landscape" | "portrait";
  /** Label text */
  label?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function ImageUpload({
  bucket,
  folder,
  value,
  onChange,
  maxSize = 5 * 1024 * 1024,
  accept = "image/jpeg,image/png,image/webp",
  aspectRatio = "square",
  label = "Imagem",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSize) {
        setError(
          `Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
        );
        return;
      }

      // Validate type
      const allowedTypes = accept.split(",").map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de arquivo não permitido");
        return;
      }

      setUploading(true);

      try {
        const supabase = createClient();

        // Generate unique filename
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(fileName);

        onChange(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Erro ao fazer upload");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, maxSize, accept, onChange]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleRemove() {
    onChange(null);
    setError(null);
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      {value ? (
        /* Preview */
        <div className="relative inline-block">
          <div
            className={`relative ${aspectClasses[aspectRatio]} w-40 overflow-hidden rounded-lg border border-border`}
          >
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Upload area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            dragOver
              ? "border-brand-400 bg-brand-50"
              : "border-border hover:border-brand-300 hover:bg-bg-secondary"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="mt-2 text-sm text-text-secondary">Enviando...</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary">
                {dragOver ? (
                  <ImageIcon className="h-5 w-5 text-brand-500" />
                ) : (
                  <Upload className="h-5 w-5 text-text-tertiary" />
                )}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Clique ou arraste uma imagem
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                JPG, PNG ou WebP (máx. {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Error */}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
