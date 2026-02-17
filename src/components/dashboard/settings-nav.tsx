"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils/cn";

const settingsLinks = [
  { href: "/dashboard/configuracoes", label: "Geral" },
  { href: "/dashboard/configuracoes/pagamentos", label: "Pagamentos" },
  { href: "/dashboard/configuracoes/frete", label: "Frete" },
  { href: "/dashboard/configuracoes/equipe", label: "Equipe" },
  { href: "/dashboard/configuracoes/whatsapp", label: "WhatsApp" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {settingsLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-text-tertiary hover:border-border hover:text-text-primary"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
