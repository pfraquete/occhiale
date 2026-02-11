"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { PanelLeftClose, PanelLeft, Glasses } from "lucide-react";
import { sidebarNavItems } from "./sidebar-nav-items";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useStore } from "@/hooks/use-store";

const COLLAPSED_KEY = "occhiale-sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_KEY) === "true";
}

export function DashboardSidebar() {
  const { storeName, storeSlug } = useStore();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  function toggleCollapse() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, String(!prev));
      return !prev;
    });
  }

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-surface transition-all duration-200 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Store name */}
      <div className="flex h-16 items-center border-b border-border px-4">
        {collapsed ? (
          <Link href="/dashboard" className="mx-auto">
            <Glasses className="h-6 w-6 text-brand-700" />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2 truncate">
            <Glasses className="h-6 w-6 shrink-0 text-brand-700" />
            <span className="truncate text-sm font-semibold text-text-primary">
              {storeName}
            </span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Visit store link */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <Link
            href={`/${storeSlug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-tertiary hover:text-text-secondary"
          >
            Visitar loja →
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={toggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
