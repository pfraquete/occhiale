import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da plataforma Occhiale, em conformidade com a LGPD.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <div className="prose prose-zinc mt-8 max-w-none">
        <h2>1. Introdução</h2>
        <p>
          A Occhiale (&quot;nós&quot;, &quot;nosso&quot; ou
          &quot;Plataforma&quot;) está comprometida com a proteção dos dados
          pessoais de seus usuários, em conformidade com a Lei Geral de Proteção
          de Dados Pessoais (LGPD — Lei n. 13.709/2018). Esta Política de
          Privacidade descreve como coletamos, usamos, armazenamos e protegemos
          seus dados pessoais.
        </p>

        <h2>2. Dados Coletados</h2>
        <p>Coletamos os seguintes tipos de dados pessoais:</p>
        <ul>
          <li>
            <strong>Dados de identificação:</strong> nome, e-mail, telefone,
            CPF/CNPJ (para lojistas).
          </li>
          <li>
            <strong>Dados de saúde:</strong> receitas oftalmológicas (grau,
            diâmetro pupilar), quando fornecidas voluntariamente pelo cliente.
          </li>
          <li>
            <strong>Dados de navegação:</strong> endereço IP, tipo de navegador,
            páginas visitadas, cookies.
          </li>
          <li>
            <strong>Dados de transação:</strong> histórico de pedidos, endereço
            de entrega, dados de pagamento (processados pelo Pagar.me).
          </li>
          <li>
            <strong>Dados de comunicação:</strong> mensagens trocadas via
            WhatsApp com o agente de vendas IA.
          </li>
        </ul>

        <h2>3. Finalidade do Tratamento</h2>
        <p>Utilizamos seus dados para:</p>
        <ul>
          <li>Fornecer e operar os serviços da plataforma.</li>
          <li>Processar pedidos e pagamentos.</li>
          <li>Oferecer atendimento personalizado via WhatsApp (agente IA).</li>
          <li>
            Enviar comunicações transacionais (confirmação de pedido, status de
            entrega).
          </li>
          <li>Melhorar nossos serviços com base em análises agregadas.</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>

        <h2>4. Base Legal</h2>
        <p>
          O tratamento dos seus dados pessoais é realizado com base nas
          seguintes hipóteses legais da LGPD:
        </p>
        <ul>
          <li>
            <strong>Consentimento (Art. 7, I):</strong> para cookies de
            analytics e marketing, e envio de comunicações promocionais.
          </li>
          <li>
            <strong>Execução de contrato (Art. 7, V):</strong> para
            processamento de pedidos e prestação de serviços.
          </li>
          <li>
            <strong>Legítimo interesse (Art. 7, IX):</strong> para melhoria dos
            serviços e prevenção de fraudes.
          </li>
          <li>
            <strong>Obrigação legal (Art. 7, II):</strong> para cumprimento de
            obrigações fiscais e regulatórias.
          </li>
        </ul>

        <h2>5. Dados Sensíveis</h2>
        <p>
          Receitas oftalmológicas são consideradas dados de saúde (dados
          sensíveis nos termos da LGPD). Esses dados são:
        </p>
        <ul>
          <li>Coletados apenas mediante consentimento explícito.</li>
          <li>Armazenados em bucket privado com acesso restrito.</li>
          <li>
            Utilizados exclusivamente para processamento de pedidos de lentes.
          </li>
          <li>Não compartilhados com terceiros sem autorização.</li>
        </ul>

        <h2>6. Compartilhamento de Dados</h2>
        <p>Seus dados podem ser compartilhados com:</p>
        <ul>
          <li>
            <strong>Lojistas:</strong> dados necessários para processar e
            entregar pedidos.
          </li>
          <li>
            <strong>Processadores de pagamento:</strong> Pagar.me, para
            processamento de transações financeiras.
          </li>
          <li>
            <strong>Provedores de infraestrutura:</strong> Supabase (banco de
            dados), Vercel (hospedagem), para operação da plataforma.
          </li>
          <li>
            <strong>Autoridades:</strong> quando exigido por lei ou ordem
            judicial.
          </li>
        </ul>

        <h2>7. Seus Direitos</h2>
        <p>
          Em conformidade com a LGPD, você tem os seguintes direitos sobre seus
          dados pessoais:
        </p>
        <ul>
          <li>Confirmação da existência de tratamento.</li>
          <li>Acesso aos dados.</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Portabilidade dos dados.</li>
          <li>Eliminação dos dados tratados com consentimento.</li>
          <li>Revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato conosco pelo e-mail:{" "}
          <strong>privacidade@occhiale.com.br</strong>
        </p>

        <h2>8. Cookies</h2>
        <p>Utilizamos os seguintes tipos de cookies:</p>
        <ul>
          <li>
            <strong>Essenciais:</strong> necessários para o funcionamento do
            site (autenticação, carrinho).
          </li>
          <li>
            <strong>Analytics:</strong> para entender como os visitantes usam o
            site (PostHog).
          </li>
          <li>
            <strong>Marketing:</strong> para personalizar anúncios e
            comunicações.
          </li>
        </ul>
        <p>
          Você pode gerenciar suas preferências de cookies a qualquer momento
          através do banner de consentimento.
        </p>

        <h2>9. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados,
          incluindo:
        </p>
        <ul>
          <li>Criptografia em trânsito (HTTPS/TLS).</li>
          <li>Row Level Security (RLS) no banco de dados.</li>
          <li>Autenticação segura com tokens JWT.</li>
          <li>Acesso restrito a dados sensíveis.</li>
          <li>Monitoramento de segurança contínuo.</li>
        </ul>

        <h2>10. Retenção de Dados</h2>
        <p>
          Seus dados são retidos pelo tempo necessário para cumprir as
          finalidades descritas nesta política, ou conforme exigido por lei.
          Dados de transações financeiras são mantidos por 5 anos para fins
          fiscais.
        </p>

        <h2>11. Alterações</h2>
        <p>
          Esta política pode ser atualizada periodicamente. Notificaremos sobre
          alterações significativas por e-mail ou através de aviso no site.
        </p>

        <h2>12. Contato</h2>
        <p>
          Para dúvidas sobre esta política ou sobre o tratamento de seus dados,
          entre em contato:
        </p>
        <ul>
          <li>
            <strong>E-mail:</strong> privacidade@occhiale.com.br
          </li>
          <li>
            <strong>Encarregado de Dados (DPO):</strong> dpo@occhiale.com.br
          </li>
        </ul>
      </div>
    </article>
  );
}
