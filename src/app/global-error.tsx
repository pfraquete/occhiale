"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#dc2626",
            }}
          >
            Erro Fatal
          </p>
          <h1
            style={{
              marginTop: "0.5rem",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Algo deu muito errado
          </h1>
          <p
            style={{
              marginTop: "1rem",
              maxWidth: "28rem",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            Ocorreu um erro crítico na aplicação. Tente recarregar a página.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "#999",
              }}
            >
              Código: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: "#7c3aed",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1a1a1a",
                backgroundColor: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "0.5rem",
                textDecoration: "none",
              }}
            >
              Voltar ao início
            </Link>
          </div>
          <p
            style={{
              marginTop: "3rem",
              fontSize: "0.75rem",
              color: "#999",
            }}
          >
            OCCHIALE — Plataforma Inteligente para Óticas
          </p>
        </div>
      </body>
    </html>
  );
}
