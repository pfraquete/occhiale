"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  QrCode,
} from "lucide-react";

interface WhatsAppConnectionProps {
  storeId: string;
}

type ConnectionStatus =
  | "loading"
  | "not_created"
  | "waiting_qr"
  | "connected"
  | "disconnected"
  | "error";

export function WhatsAppConnection({ storeId }: WhatsAppConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [_instanceName, setInstanceName] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/whatsapp/instance?storeId=${storeId}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Erro ao verificar status");
        return;
      }

      setInstanceName(data.instanceName ?? null);
      setError(null);

      switch (data.status) {
        case "connected":
          setStatus("connected");
          setQrCode(null);
          // Stop polling when connected
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          break;
        case "waiting_qr":
          setStatus("waiting_qr");
          setQrCode(data.qrCode ?? null);
          break;
        case "not_created":
          setStatus("not_created");
          setQrCode(null);
          break;
        case "disconnected":
          setStatus("disconnected");
          setQrCode(null);
          break;
        default:
          setStatus("error");
      }
    } catch {
      setStatus("error");
      setError("Erro de conexão");
    }
  }, [storeId]);

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Start polling when waiting for QR scan
  useEffect(() => {
    if (status === "waiting_qr") {
      pollRef.current = setInterval(checkStatus, 5000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, checkStatus]);

  async function handleCreate() {
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar instância");
        return;
      }

      setInstanceName(data.instanceName ?? null);
      setQrCode(data.qrCode ?? null);
      setStatus("waiting_qr");
    } catch {
      setError("Erro de conexão");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao desconectar");
        return;
      }

      setStatus("disconnected");
      setQrCode(null);
    } catch {
      setError("Erro de conexão");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Conexão WhatsApp
          </h2>
          <p className="mt-1 text-xs text-text-tertiary">
            Conecte seu WhatsApp para ativar o atendimento com IA.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content based on status */}
      <div className="mt-5">
        {status === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        )}

        {status === "not_created" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary">
              <MessageSquare className="h-7 w-7 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-secondary">
              Nenhuma instância WhatsApp configurada para esta loja.
            </p>
            <button
              onClick={handleCreate}
              disabled={actionLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              Conectar WhatsApp
            </button>
          </div>
        )}

        {status === "waiting_qr" && (
          <div className="text-center">
            <p className="mb-4 text-sm text-text-secondary">
              Escaneie o QR Code abaixo com seu WhatsApp:
            </p>

            {qrCode ? (
              <div className="mx-auto inline-block rounded-xl border border-border bg-white p-4">
                {qrCode.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="h-64 w-64"
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center">
                    <QrCode className="h-16 w-16 text-text-tertiary" />
                    <p className="mt-2 text-xs text-text-tertiary">
                      QR Code indisponível
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-border">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-tertiary">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Aguardando conexão... (atualiza automaticamente)
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-left text-xs text-blue-700">
              <strong>Como escanear:</strong>
              <ol className="mt-1 list-inside list-decimal space-y-1">
                <li>Abra o WhatsApp no seu celular</li>
                <li>
                  Toque em <strong>Mais opções</strong> (⋮) ou{" "}
                  <strong>Configurações</strong>
                </li>
                <li>
                  Toque em <strong>Aparelhos conectados</strong>
                </li>
                <li>
                  Toque em <strong>Conectar um aparelho</strong>
                </li>
                <li>Aponte a câmera para o QR Code acima</li>
              </ol>
            </div>
          </div>
        )}

        {status === "connected" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">
              WhatsApp conectado com sucesso!
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              A IA está pronta para atender seus clientes.
            </p>
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              Desconectar
            </button>
          </div>
        )}

        {status === "disconnected" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <WifiOff className="h-7 w-7 text-yellow-600" />
            </div>
            <p className="text-sm text-text-secondary">
              WhatsApp desconectado.
            </p>
            <button
              onClick={checkStatus}
              disabled={actionLoading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reconectar
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <p className="text-sm text-text-secondary">
              Não foi possível verificar o status.
            </p>
            <button
              onClick={checkStatus}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Conectado
        </span>
      );
    case "waiting_qr":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
          Aguardando
        </span>
      );
    case "disconnected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Desconectado
        </span>
      );
    default:
      return null;
  }
}
