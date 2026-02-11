"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-secondary">
        <span className="text-6xl">👓</span>
      </div>
    );
  }

  const currentImage = images[currentIndex] ?? images[0]!;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-secondary">
        <Image
          src={currentImage}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex(
                  (currentIndex - 1 + images.length) % images.length
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 p-2 text-text-secondary backdrop-blur-sm transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % images.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 p-2 text-text-secondary backdrop-blur-sm transition-colors hover:bg-surface"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === currentIndex
                  ? "border-brand-600"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
