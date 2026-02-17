"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, ExternalLink, ChevronRight } from "lucide-react";
import { Avatar } from "@/shared/ui/components/avatar";
import { MobileSidebar } from "./mobile-sidebar";
import { useStore } from "@/hooks/use-store";
import { createClient } from "@/shared/lib/supabase/client";
import { useState } from "react";

/** Map pathname segments to pt-BR labels */
const segmentLabels: Record<string, string> = {
  dashboard: "Início",
  pedidos: "Pedidos",
  produtos: "Produtos",
  clientes: "Clientes",
  configuracoes: "Configurações",
  novo: "Novo",
  pagamentos: "Pagamentos",
  frete: "Frete",
  equipe: "Equipe",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Skip the first "dashboard" in breadcrumb display (shown as "Início")
  const crumbs = segments.map((segment, index) => {
    const label = segmentLabels[segment] ?? segment;
    const isLast = index === segments.length - 1;
    return { label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-text-tertiary">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          <span className={crumb.isLast ? "text-text-primary font-medium" : ""}>
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function DashboardHeader() {
  const { userName, userEmail, storeSlug } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        {/* Visit store */}
        <a
          href={`/${storeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-text-tertiary hover:text-text-secondary md:flex"
        >
          Ver loja <ExternalLink className="h-3 w-3" />
        </a>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-bg-secondary"
          >
            <Avatar name={userName} size="sm" />
            <span className="hidden text-sm font-medium text-text-primary md:inline">
              {userName.split(" ")[0]}
            </span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-border bg-surface py-1 shadow-md">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-text-primary">
                    {userName}
                  </p>
                  <p className="text-xs text-text-tertiary">{userEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
