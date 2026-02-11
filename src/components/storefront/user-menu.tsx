"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { user, isLoading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-surface-secondary" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
      >
        <User className="h-4 w-4" />
        Entrar
      </Link>
    );
  }

  const name =
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    "Conta";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <span className="text-xs font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:inline">{name.split(" ")[0]}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-text-primary">{name}</p>
            <p className="text-xs text-text-tertiary">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-secondary"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
