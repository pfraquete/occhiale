import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-brand-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-tertiary">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
