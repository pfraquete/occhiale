"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/modules/core/auth/components/register-form";

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-text-tertiary">
          Carregando...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
