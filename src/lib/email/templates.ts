// ============================================
// OCCHIALE - Email Templates
// HTML templates for transactional emails
// ============================================

import { formatCentsToBRL } from "@/lib/utils/format";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://occhiale.com.br";

// ------------------------------------------
// Base Layout
// ------------------------------------------

function baseLayout(content: string, storeName?: string): string {
  const brand = storeName ?? "Occhiale";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; }
    .header { background: #18181b; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; letter-spacing: 2px; }
    .content { padding: 32px; }
    .content h2 { font-size: 22px; margin-top: 0; color: #18181b; }
    .content p { font-size: 15px; line-height: 1.6; color: #3f3f46; margin: 12px 0; }
    .btn { display: inline-block; background: #18181b; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
    .footer a { color: #71717a; }
    table.order { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.order th { text-align: left; padding: 8px 12px; background: #f4f4f5; font-size: 13px; color: #71717a; }
    table.order td { padding: 8px 12px; border-bottom: 1px solid #e4e4e7; font-size: 14px; }
    .total-row td { font-weight: 700; border-top: 2px solid #18181b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brand.toUpperCase()}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${brand}. Todos os direitos reservados.</p>
      <p><a href="${BASE_URL}">Visite nosso site</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ------------------------------------------
// Order Confirmation
// ------------------------------------------

interface OrderItem {
  name: string;
  quantity: number;
  price: number; // cents
}

interface OrderConfirmationParams {
  customerName: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number; // cents
  shipping: number; // cents
  total: number; // cents
  paymentMethod: string;
  storeName: string;
  storeSlug: string;
}

export function orderConfirmationEmail(params: OrderConfirmationParams): {
  subject: string;
  html: string;
  text: string;
} {
  const itemRows = params.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatCentsToBRL(item.price * item.quantity)}</td>
    </tr>`
    )
    .join("");

  const html = baseLayout(
    `
    <h2>Pedido confirmado! 🎉</h2>
    <p>Olá <strong>${params.customerName}</strong>,</p>
    <p>Seu pedido <strong>#${params.orderNumber}</strong> foi recebido com sucesso.</p>

    <table class="order">
      <thead>
        <tr>
          <th>Produto</th>
          <th style="text-align:center">Qtd</th>
          <th style="text-align:right">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr>
          <td colspan="2" style="text-align:right">Subtotal</td>
          <td style="text-align:right">${formatCentsToBRL(params.subtotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align:right">Frete</td>
          <td style="text-align:right">${params.shipping === 0 ? "Grátis" : formatCentsToBRL(params.shipping)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align:right">Total</td>
          <td style="text-align:right">${formatCentsToBRL(params.total)}</td>
        </tr>
      </tbody>
    </table>

    <p><strong>Forma de pagamento:</strong> ${params.paymentMethod}</p>

    <p style="text-align:center">
      <a href="${BASE_URL}/${params.storeSlug}" class="btn">Visitar Loja</a>
    </p>
    `,
    params.storeName
  );

  const text = `Pedido #${params.orderNumber} confirmado!\n\nOlá ${params.customerName}, seu pedido foi recebido. Total: ${formatCentsToBRL(params.total)}.\n\nPagamento: ${params.paymentMethod}`;

  return {
    subject: `Pedido #${params.orderNumber} confirmado — ${params.storeName}`,
    html,
    text,
  };
}

// ------------------------------------------
// Order Status Update
// ------------------------------------------

interface OrderStatusParams {
  customerName: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  trackingCode?: string;
  storeName: string;
  storeSlug: string;
}

export function orderStatusEmail(params: OrderStatusParams): {
  subject: string;
  html: string;
  text: string;
} {
  const trackingSection = params.trackingCode
    ? `<p><strong>Código de rastreio:</strong> ${params.trackingCode}</p>
       <p><a href="https://rastreamento.correios.com.br/app/index.php" class="btn">Rastrear Pedido</a></p>`
    : "";

  const html = baseLayout(
    `
    <h2>Atualização do pedido #${params.orderNumber}</h2>
    <p>Olá <strong>${params.customerName}</strong>,</p>
    <p>O status do seu pedido foi atualizado para:</p>
    <p style="text-align:center; font-size: 18px; font-weight: 700; color: #18181b; background: #f4f4f5; padding: 16px; border-radius: 8px;">
      ${params.statusLabel}
    </p>
    ${trackingSection}
    `,
    params.storeName
  );

  const text = `Pedido #${params.orderNumber} — Status: ${params.statusLabel}${params.trackingCode ? `\nRastreio: ${params.trackingCode}` : ""}`;

  return {
    subject: `Pedido #${params.orderNumber}: ${params.statusLabel} — ${params.storeName}`,
    html,
    text,
  };
}

// ------------------------------------------
// Welcome Email
// ------------------------------------------

interface WelcomeParams {
  userName: string;
  storeName?: string;
}

export function welcomeEmail(params: WelcomeParams): {
  subject: string;
  html: string;
  text: string;
} {
  const html = baseLayout(
    `
    <h2>Bem-vindo ao Occhiale! 👋</h2>
    <p>Olá <strong>${params.userName}</strong>,</p>
    <p>Sua conta foi criada com sucesso. ${params.storeName ? `Sua loja <strong>${params.storeName}</strong> está pronta para receber produtos e clientes.` : "Agora você pode criar sua loja e começar a vender."}</p>
    <p>Com o Occhiale, você tem:</p>
    <ul>
      <li>E-commerce completo para sua ótica</li>
      <li>Agente de vendas IA via WhatsApp</li>
      <li>CRM inteligente para fidelizar clientes</li>
      <li>Dashboard com métricas em tempo real</li>
    </ul>
    <p style="text-align:center">
      <a href="${BASE_URL}/dashboard" class="btn">Acessar Dashboard</a>
    </p>
    `
  );

  const text = `Bem-vindo ao Occhiale, ${params.userName}! Sua conta foi criada com sucesso. Acesse: ${BASE_URL}/dashboard`;

  return {
    subject: "Bem-vindo ao Occhiale! 🎉",
    html,
    text,
  };
}

// ------------------------------------------
// Team Invite
// ------------------------------------------

interface InviteParams {
  inviterName: string;
  storeName: string;
  role: string;
}

export function teamInviteEmail(params: InviteParams): {
  subject: string;
  html: string;
  text: string;
} {
  const roleLabel =
    params.role === "admin" ? "Administrador" : "Membro da equipe";

  const html = baseLayout(
    `
    <h2>Convite para equipe</h2>
    <p>Olá!</p>
    <p><strong>${params.inviterName}</strong> convidou você para fazer parte da equipe da loja <strong>${params.storeName}</strong> como <strong>${roleLabel}</strong>.</p>
    <p style="text-align:center">
      <a href="${BASE_URL}/dashboard" class="btn">Aceitar Convite</a>
    </p>
    <p style="font-size: 13px; color: #71717a;">Se você não esperava este convite, pode ignorar este email.</p>
    `,
    params.storeName
  );

  const text = `${params.inviterName} convidou você para a equipe da ${params.storeName} como ${roleLabel}. Acesse: ${BASE_URL}/dashboard`;

  return {
    subject: `Convite: ${params.storeName} — ${roleLabel}`,
    html,
    text,
  };
}

// ------------------------------------------
// Abandoned Cart
// ------------------------------------------

interface AbandonedCartParams {
  customerName: string;
  storeName: string;
  storeSlug: string;
  itemCount: number;
}

export function abandonedCartEmail(params: AbandonedCartParams): {
  subject: string;
  html: string;
  text: string;
} {
  const html = baseLayout(
    `
    <h2>Você esqueceu algo? 👀</h2>
    <p>Olá <strong>${params.customerName}</strong>,</p>
    <p>Notamos que você deixou <strong>${params.itemCount} ${params.itemCount === 1 ? "item" : "itens"}</strong> no seu carrinho na <strong>${params.storeName}</strong>.</p>
    <p>Seus óculos perfeitos estão esperando por você!</p>
    <p style="text-align:center">
      <a href="${BASE_URL}/${params.storeSlug}/carrinho" class="btn">Voltar ao Carrinho</a>
    </p>
    <p style="font-size: 13px; color: #71717a;">Se você já finalizou a compra, ignore este email.</p>
    `,
    params.storeName
  );

  const text = `Olá ${params.customerName}, você tem ${params.itemCount} itens no carrinho da ${params.storeName}. Finalize: ${BASE_URL}/${params.storeSlug}/carrinho`;

  return {
    subject: `Seu carrinho está esperando — ${params.storeName}`,
    html,
    text,
  };
}
