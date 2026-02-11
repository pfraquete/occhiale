"use client";

import { MessageSquare } from "lucide-react";

export function WhatsAppEmptyState() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
          <MessageSquare className="h-8 w-8 text-text-tertiary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">
          Nenhuma conversa ainda
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Conecte seu WhatsApp para começar a receber mensagens e ativar o
          atendimento com IA.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-bg-secondary p-4 text-left">
          <h3 className="text-sm font-medium text-text-primary">
            Como conectar:
          </h3>
          <ol className="mt-2 space-y-2 text-sm text-text-secondary">
            <li>1. Acesse as Configurações da loja</li>
            <li>2. Na seção WhatsApp, clique em &quot;Conectar&quot;</li>
            <li>3. Escaneie o QR Code com seu WhatsApp</li>
            <li>4. Pronto! A Lu começará a atender automaticamente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
