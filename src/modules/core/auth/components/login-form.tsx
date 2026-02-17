"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../actions/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";

export function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (redirect) formData.set("redirect", redirect);

        const result = await loginAction(formData);
        if (!result.success) {
            setError(result.error ?? "Erro ao entrar");
        }
        setLoading(false);
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold text-text-primary">
                    Entrar
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Acesse sua conta para acompanhar pedidos
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="email" className="mb-1.5">
                        E-mail
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <Label htmlFor="password" className="mb-1.5">
                        Senha
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            className="pr-10"
                            placeholder="••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link
                        href="/recuperar-senha"
                        className="text-sm text-brand-600 hover:text-brand-700"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? "Entrando..." : "Entrar"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
                Não tem conta?{" "}
                <Link
                    href={`/cadastro${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                >
                    Criar conta
                </Link>
            </p>
        </>
    );
}
