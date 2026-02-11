"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido") ?? "";
  const metodo = searchParams.get("metodo") ?? "pix";
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
        Pedido Confirmado!
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Seu pedido <strong className="text-text-primary">{pedido}</strong> foi
        recebido com sucesso.
      </p>

      {metodo === "pix" && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Pague com PIX
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            O QR Code e o código copia-cola serão exibidos quando o pagamento
            for gerado pelo sistema. Aguarde a confirmação por e-mail.
          </p>
          <div className="mt-4 rounded-lg bg-surface-secondary p-4">
            <p className="break-all text-xs font-mono text-text-secondary">
              {pedido}
            </p>
            <button
              onClick={() => copyToClipboard(pedido)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copiado!" : "Copiar código"}
            </button>
          </div>
        </div>
      )}

      {metodo === "boleto" && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Boleto Gerado
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            O boleto será enviado para seu e-mail. Você tem 3 dias úteis para
            efetuar o pagamento.
          </p>
        </div>
      )}

      {metodo === "credit_card" && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Pagamento Aprovado
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            O pagamento com cartão de crédito foi processado. Você receberá a
            confirmação por e-mail.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-text-secondary">
        Você receberá atualizações sobre o pedido por e-mail.
      </p>

      <Link
        href="/"
        className="mt-4 inline-flex rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Voltar à Loja
      </Link>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-text-tertiary">
          Carregando...
        </div>
      }
    >
      <ConfirmacaoContent />
    </Suspense>
  );
}
