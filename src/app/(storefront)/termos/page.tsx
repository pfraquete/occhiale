import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso da plataforma Occhiale.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Termos de Uso
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="prose prose-zinc mt-8 max-w-none">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar a plataforma Occhiale (&quot;Plataforma&quot;),
          você concorda com estes Termos de Uso. Se você não concorda com algum
          termo, não utilize a Plataforma.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          A Occhiale é uma plataforma SaaS (Software as a Service) que oferece a
          óticas brasileiras:
        </p>
        <ul>
          <li>E-commerce para venda de óculos e lentes.</li>
          <li>Agente de vendas com inteligência artificial via WhatsApp.</li>
          <li>
            CRM (Customer Relationship Management) para gestão de clientes.
          </li>
          <li>Dashboard com métricas e relatórios.</li>
        </ul>

        <h2>3. Cadastro e Conta</h2>
        <p>
          Para utilizar a Plataforma como lojista, você deve criar uma conta
          fornecendo informações verdadeiras e completas. Você é responsável por
          manter a confidencialidade de suas credenciais de acesso.
        </p>

        <h2>4. Responsabilidades do Lojista</h2>
        <p>O lojista se compromete a:</p>
        <ul>
          <li>
            Fornecer informações precisas sobre produtos, preços e
            disponibilidade.
          </li>
          <li>Cumprir o Código de Defesa do Consumidor (CDC).</li>
          <li>
            Garantir que receitas oftalmológicas sejam verificadas por
            profissional habilitado antes de processar pedidos de lentes.
          </li>
          <li>Respeitar a LGPD no tratamento de dados de seus clientes.</li>
          <li>Manter suas informações fiscais atualizadas.</li>
        </ul>

        <h2>5. Responsabilidades do Consumidor</h2>
        <p>O consumidor se compromete a:</p>
        <ul>
          <li>Fornecer informações verdadeiras no cadastro e checkout.</li>
          <li>
            Enviar receitas oftalmológicas válidas e dentro do prazo de
            validade.
          </li>
          <li>Respeitar os termos de troca e devolução de cada loja.</li>
        </ul>

        <h2>6. Pagamentos</h2>
        <p>
          Os pagamentos são processados pela Pagar.me. A Occhiale não armazena
          dados de cartão de crédito. As formas de pagamento disponíveis incluem
          cartão de crédito, PIX e boleto bancário.
        </p>

        <h2>7. Agente de IA</h2>
        <p>
          O agente de vendas via WhatsApp utiliza inteligência artificial para
          auxiliar clientes. O agente:
        </p>
        <ul>
          <li>Não substitui orientação médica profissional.</li>
          <li>
            Pode encaminhar conversas para atendimento humano quando necessário.
          </li>
          <li>Opera dentro dos limites configurados pelo lojista.</li>
        </ul>

        <h2>8. Propriedade Intelectual</h2>
        <p>
          A Plataforma, incluindo seu código, design, marca e conteúdo, é
          propriedade da Occhiale. O lojista mantém a propriedade sobre seus
          produtos, imagens e conteúdo.
        </p>

        <h2>9. Limitação de Responsabilidade</h2>
        <p>
          A Occhiale não se responsabiliza por: transações entre lojistas e
          consumidores, qualidade dos produtos vendidos, erros em receitas
          oftalmológicas fornecidas por consumidores, ou indisponibilidade
          temporária da Plataforma.
        </p>

        <h2>10. Rescisão</h2>
        <p>
          Qualquer parte pode encerrar o uso da Plataforma a qualquer momento. A
          Occhiale se reserva o direito de suspender ou encerrar contas que
          violem estes Termos.
        </p>

        <h2>11. Foro</h2>
        <p>
          Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer
          questões decorrentes destes Termos.
        </p>

        <h2>12. Contato</h2>
        <p>
          Para dúvidas sobre estes Termos, entre em contato pelo e-mail:{" "}
          <strong>contato@occhiale.com.br</strong>
        </p>
      </div>
    </article>
  );
}
