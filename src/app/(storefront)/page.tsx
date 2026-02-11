import Link from "next/link";
import {
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Zap,
  Eye,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Atendimento com IA no WhatsApp",
    description:
      "Sua assistente virtual atende clientes 24h, busca produtos, monta orçamentos e analisa receitas automaticamente.",
  },
  {
    icon: ShoppingBag,
    title: "Loja Virtual Completa",
    description:
      "Catálogo de produtos com busca inteligente, carrinho, checkout com PIX, cartão e boleto via Pagar.me.",
  },
  {
    icon: Eye,
    title: "OCR de Receitas",
    description:
      "Análise automática de receitas médicas por visão computacional. Extrai grau, cilindro, eixo e adição em segundos.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description:
      "Gerencie pedidos, clientes, estoque e acompanhe métricas de vendas em tempo real.",
  },
  {
    icon: Zap,
    title: "Automações de CRM",
    description:
      "Mensagens automáticas pós-venda, lembretes de receita vencendo, reativação de clientes inativos.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description:
      "Dados protegidos com criptografia, conformidade LGPD e isolamento multi-tenant por loja.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <h1 className="font-display text-4xl font-bold tracking-tight text-brand-900 md:text-6xl">
          Sua ótica no <span className="text-brand-600">próximo nível</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
          OCCHIALE é a plataforma inteligente que une loja virtual, atendimento
          com IA no WhatsApp e gestão completa para óticas.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Começar Gratuitamente
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-8 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-bg-secondary"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-bg-secondary px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-text-primary">
            Tudo que sua ótica precisa
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-text-secondary">
            Uma plataforma completa para vender mais, atender melhor e gerenciar
            com inteligência.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <feature.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-text-primary">
          Pronto para transformar sua ótica?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Crie sua conta em menos de 2 minutos e comece a usar todas as
          funcionalidades.
        </p>
        <Link
          href="/cadastro"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Criar Minha Loja
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-tertiary">
        <p>
          &copy; {new Date().getFullYear()} OCCHIALE. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
