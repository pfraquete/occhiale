import Link from "next/link";
import { Glasses, MessageCircle } from "lucide-react";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Glasses className="h-7 w-7 text-amber-400" />
            <span className="text-xl font-bold tracking-tight">OCCHIALE</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400"
            >
              Criar Loja
            </Link>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-400 sm:hidden"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Glasses className="h-6 w-6 text-amber-400" />
                <span className="text-lg font-bold">OCCHIALE</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                Plataforma completa para óticas. Venda online, gerencie clientes
                e automatize atendimento via WhatsApp com IA.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-zinc-300">
                Plataforma
              </h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li>
                  <Link href="/cadastro" className="hover:text-zinc-300">
                    Criar Loja
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-zinc-300">
                    Acessar Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-zinc-300">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li>
                  <Link href="/privacidade" className="hover:text-zinc-300">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/termos" className="hover:text-zinc-300">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-zinc-300">
                Contato
              </h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li>contato@occhiale.com.br</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} OCCHIALE. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/5500000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-400"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
