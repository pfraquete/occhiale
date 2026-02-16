import { getEvolutionClient } from "./client";

/**
 * Sends a notification to the customer when their order payment is confirmed.
 */
export async function sendOrderPaidNotification(params: {
    whatsappNumber: string; // Store's WhatsApp number (instance name)
    customerPhone: string;
    customerName: string;
    orderNumber: string;
    storeName: string;
}) {
    const client = getEvolutionClient();

    // Format phone: remove non-digits
    const to = params.customerPhone.replace(/\D/g, "");

    const text = `Olá *${params.customerName}*! 🎉\n\nIdentificamos o pagamento do seu pedido *#${params.orderNumber}* na *${params.storeName}*.\n\nFicamos muito felizes com sua escolha! Já estamos preparando tudo com muito carinho. Assim que o pedido for enviado, você receberá uma nova notificação por aqui.\n\nQualquer dúvida, estamos à disposição!`;

    try {
        await client.sendText(params.whatsappNumber, to, text);
    } catch (error) {
        console.error(`Failed to send order paid notification to ${to}:`, error);
        // Don't throw, we don't want to break the webhook flow if notification fails
    }
}

/**
 * Sends a notification when a payment fails.
 */
export async function sendPaymentFailedNotification(params: {
    whatsappNumber: string;
    customerPhone: string;
    customerName: string;
    orderNumber: string;
}) {
    const client = getEvolutionClient();
    const to = params.customerPhone.replace(/\D/g, "");

    const text = `Olá *${params.customerName}*. Notamos que houve um problema com o pagamento do seu pedido *#${params.orderNumber}*.\n\nMas não se preocupe! Você pode tentar novamente no nosso site ou entrar em contato conosco por aqui para ajudarmos você a concluir sua compra. 😊`;

    try {
        await client.sendText(params.whatsappNumber, to, text);
    } catch (error) {
        console.error(`Failed to send payment failed notification to ${to}:`, error);
    }
}

/**
 * Sends a notification when a Service Order status changes.
 */
export async function sendOSStatusNotification(params: {
    whatsappNumber: string;
    customerPhone: string;
    customerName: string;
    orderNumber: string;
    storeName: string;
    status: string;
}) {
    const client = getEvolutionClient();
    const to = params.customerPhone.replace(/\D/g, "");

    let text = "";

    switch (params.status) {
        case "ready_for_pickup":
            text = `Olá *${params.customerName}*! Ótimas notícias! 🎉\n\nSeus óculos do pedido *#${params.orderNumber}* já estão prontos e passaram pelo nosso controle de qualidade.\n\nVocê já pode vir retirá-los na *${params.storeName}*. Estamos ansiosos para te ver! 😊`;
            break;
        case "surfacing":
        case "mounting":
            text = `Olá *${params.customerName}*! Passando para te avisar que seus óculos do pedido *#${params.orderNumber}* já estão em fase de produção no laboratório. Logo logo estarão prontos! 🛠️`;
            break;
        default:
            return; // Don't send for other statuses yet
    }

    try {
        await client.sendText(params.whatsappNumber, to, text);
    } catch (error) {
        console.error(`Failed to send OS status notification to ${to}:`, error);
    }
}
