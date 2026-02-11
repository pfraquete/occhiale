"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/utils/categories";
import { useStore } from "./store-provider";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { store } = useStore();
  const slug = store.slug;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-secondary lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-surface shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-display text-lg font-bold text-brand-900">
            {store.name}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-text-secondary hover:bg-surface-secondary"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4">
          <Link
            href={`/${slug}`}
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Início
          </Link>
          <Link
            href={`/${slug}/catalogo`}
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Todos os Produtos
          </Link>

          <div className="my-2 border-t border-border" />
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Categorias
          </p>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.db}
                href={`/${slug}/catalogo?categoria=${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
