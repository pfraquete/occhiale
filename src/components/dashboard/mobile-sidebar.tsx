"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Glasses } from "lucide-react";
import { Sheet } from "@/shared/ui/components/sheet";
import { sidebarNavItems } from "./sidebar-nav-items";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useStore } from "@/hooks/use-store";

export function MobileSidebar() {
  const { storeName, storeSlug } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-text-secondary hover:bg-bg-secondary md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} side="left">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Glasses className="h-6 w-6 text-brand-700" />
            <span className="text-sm font-semibold text-text-primary">
              {storeName}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {sidebarNavItems.map((item) => (
            <div key={item.href} onClick={() => setOpen(false)}>
              <SidebarNavItem
                label={item.label}
                href={item.href}
                icon={item.icon}
                collapsed={false}
              />
            </div>
          ))}
        </nav>

        {/* Visit store */}
        <div className="mt-auto border-t border-border p-3">
          <Link
            href={`/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-tertiary hover:text-text-secondary"
          >
            Visitar loja →
          </Link>
        </div>
      </Sheet>
    </>
  );
}
