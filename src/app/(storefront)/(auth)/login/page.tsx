"use client";

import { Suspense } from "react";
import { LoginForm } from "@/modules/core/auth/components/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-text-tertiary">
          Carregando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
