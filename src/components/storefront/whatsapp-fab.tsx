"use client";

import { MessageCircle } from "lucide-react";
import { useStore } from "./store-provider";

export function WhatsAppFab() {
  const { store } = useStore();

  if (!store.whatsapp_number) return null;

  const phone = store.whatsapp_number.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá! Vim pela loja ${store.name} e gostaria de mais informações.`
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Falar pelo WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
