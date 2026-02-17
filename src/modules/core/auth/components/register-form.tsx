"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "../actions/auth";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await registerAction(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error ?? "Erro ao criar conta");
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-text-primary">
                    Conta criada!
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                    Verifique seu e-mail para confirmar a conta.
                </p>
                <Link
                    href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                    className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                    Ir para login
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold text-text-primary">
                    Criar Conta
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Cadastre-se para acompanhar seus pedidos
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="mb-1.5">
                        Nome completo
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Seu nome"
                    />
                </div>

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
                    <Label htmlFor="phone" className="mb-1.5">
                        Telefone (opcional)
                    </Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-8888"
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
                            minLength={6}
                            className="pr-10"
                            placeholder="Mínimo 6 caracteres"
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

                <div>
                    <Label htmlFor="confirmPassword" className="mb-1.5">
                        Confirmar Senha
                    </Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="Repita a senha"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? "Criando..." : "Criar Conta"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
                Já tem conta?{" "}
                <Link
                    href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                >
                    Entrar
                </Link>
            </p>
        </>
    );
}
