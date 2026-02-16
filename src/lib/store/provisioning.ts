import { createClient } from "@/lib/supabase/server";
import { getEvolutionClient } from "@/lib/evolution/client";

/**
 * Seeds default SEO pages for a new store.
 */
async function seedDefaultSeoPages(storeId: string) {
    const supabase = await createClient();

    const defaultPages = [
        {
            store_id: storeId,
            slug: "home",
            title: "Seja bem-vindo",
            meta_description: "A melhor ótica da região agora online.",
            content_html: "<h1>Bem-vindo à nossa loja!</h1><p>Confira nossos produtos e faça seu pedido pelo WhatsApp.</p>",
            page_type: "landing",
            is_published: true,
        },
        {
            store_id: storeId,
            slug: "sobre",
            title: "Nossa História",
            meta_description: "Conheça mais sobre nossa trajetória no mercado óptico.",
            content_html: "<h1>Sobre nós</h1><p>Trabalhamos para oferecer a melhor visão para você.</p>",
            page_type: "guide",
            is_published: true,
        },
        {
            store_id: storeId,
            slug: "contato",
            title: "Fale Conosco",
            meta_description: "Entre em contato conosco para tirar suas dúvidas.",
            content_html: "<h1>Contato</h1><p>Estamos prontos para te atender.</p>",
            page_type: "landing",
            is_published: true,
        },
    ];

    const { error } = await supabase.from("seo_pages").insert(defaultPages);
    if (error) console.error("Error seeding SEO pages:", error);
}

/**
 * Seeds default CRM automations for a new store.
 */
async function seedDefaultCrmAutomations(storeId: string) {
    const supabase = await createClient();

    const defaultAutomations = [
        {
            store_id: storeId,
            name: "Carrinho Abandonado",
            trigger_type: "abandoned_cart",
            delay_hours: 2,
            action_type: "whatsapp_message",
            template: "Olá {{customer_name}}, notamos que você deixou produtos no carrinho. Precisa de ajuda para concluir a compra?",
            is_active: true,
        },
        {
            store_id: storeId,
            name: "Fidelização de Aniversário",
            trigger_type: "birthday",
            delay_hours: 0,
            action_type: "whatsapp_message",
            template: "Parabéns, {{customer_name}}! 🎉 Hoje é seu dia e preparamos um desconto especial de 15% para você na {{store_name}}!",
            is_active: true,
        },
        {
            store_id: storeId,
            name: "Lembrete de Receita Vencendo",
            trigger_type: "prescription_expiring",
            delay_hours: 0,
            action_type: "whatsapp_message",
            template: "Olá {{customer_name}}, sua receita de óculos está próxima do vencimento. Que tal agendar um novo exame?",
            is_active: false,
        },
    ];

    const { error } = await supabase.from("crm_automations").insert(defaultAutomations);
    if (error) console.error("Error seeding CRM automations:", error);
}

/**
 * Provisions a WhatsApp instance via Evolution API.
 */
async function provisionWhatsAppInstance(storeId: string, whatsappNumber: string) {
    const client = getEvolutionClient();
    const instanceName = `store-${storeId}`;

    try {
        // Webhook URL for Evolution API to push updates back to us
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/evolution`;

        await client.createInstance(instanceName, webhookUrl);
        console.log(`WhatsApp instance created for store ${storeId}`);
    } catch (error) {
        console.error(`Failed to provision WhatsApp instance for store ${storeId}:`, error);
    }
}

/**
 * Orchestrates the set up of a new store.
 */
export async function setupNewStore(params: {
    storeId: string;
    whatsappNumber?: string;
}) {
    console.log(`Setting up new store: ${params.storeId}`);

    // 1. Seed SEO Pages
    await seedDefaultSeoPages(params.storeId);

    // 2. Seed CRM Automations
    await seedDefaultCrmAutomations(params.storeId);

    // 3. Provision WhatsApp Instance if number is provided
    if (params.whatsappNumber) {
        await provisionWhatsAppInstance(params.storeId, params.whatsappNumber);
    }

    console.log(`Store ${params.storeId} setup complete.`);
}
