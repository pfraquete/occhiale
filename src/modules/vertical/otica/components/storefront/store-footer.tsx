import Link from "next/link";
import { CreditCard, Shield, Truck } from "lucide-react";
import type { Tables } from "@/shared/types/database";

interface StoreFooterProps {
  store: Tables<"stores">;
}

export function StoreFooter({ store }: StoreFooterProps) {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      {/* Trust badges */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Entrega Segura
            </p>
            <p className="text-xs text-text-tertiary">
              Enviamos para todo o Brasil
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Pagamento Seguro
            </p>
            <p className="text-xs text-text-tertiary">
              PIX, Cartão até 12x, Boleto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Compra Garantida
            </p>
            <p className="text-xs text-text-tertiary">
              Troca e devolução em até 30 dias
            </p>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} {store.name}. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/${store.slug}/catalogo`}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Catálogo
            </Link>
            {store.whatsapp_number && (
              <a
                href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-tertiary hover:text-text-secondary"
              >
                WhatsApp
              </a>
            )}
          </div>
          <p className="text-[10px] text-text-tertiary/60">
            Powered by{" "}
            <Link href="/" className="hover:text-brand-600">
              Occhiale
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
