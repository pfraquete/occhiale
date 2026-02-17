

import { Json } from "@/shared/types/database";

const FOCUS_NFE_API_URL = process.env.NODE_ENV === "production"
    ? "https://api.focusnfe.com.br"
    : "https://homologacao.focusnfe.com.br";

interface FocusNFeConfig {
    token: string;
}

export async function createFocusNFeClient(config: FocusNFeConfig) {
    const { token } = config;

    async function request(path: string, options: RequestInit = {}) {
        const response = await fetch(`${FOCUS_NFE_API_URL}${path}`, {
            ...options,
            headers: {
                "Authorization": `Basic ${Buffer.from(token + ":").toString("base64")}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || "Erro na Focus NFe");
        }

        return response.json();
    }

    return {
        /**
         * Emit NFC-e (Model 65)
         */
        async emitNFCe(orderData: any) {
            return request("/v2/nfce?ref=" + orderData.order_number, {
                method: "POST",
                body: JSON.stringify(orderData),
            });
        },

        /**
         * Emit NF-e (Model 55)
         */
        async emitNFe(orderData: any) {
            return request("/v2/nfe?ref=" + orderData.order_number, {
                method: "POST",
                body: JSON.stringify(orderData),
            });
        },

        /**
         * Get Document Status
         */
        async getStatus(ref: string, model: "nfe" | "nfce" = "nfce") {
            return request(`/v2/${model}/${ref}`);
        },

        /**
         * Cancel Document
         */
        async cancel(ref: string, reason: string, model: "nfe" | "nfce" = "nfce") {
            return request(`/v2/${model}/${ref}`, {
                method: "DELETE",
                body: JSON.stringify({ justificativa: reason }),
            });
        }
    };
}

/**
 * Maps our order and store data to Focus NFe format
 */
export function mapOrderToFocusNFe(order: any, store: any, items: any[], customer: any) {
    // This is a simplified mapping. Real world would require NCM, CFOP, etc.
    // We'll use defaults or store settings for these.

    return {
        "data_emissao": new Date().toISOString(),
        "natureza_operacao": "Venda de mercadoria",
        "regime_especial_tributacao": store.tax_regime === "simples_nacional" ? "1" : "0",
        "tipo_operacao": "1", // Saída
        "finalidade_emissao": "1", // Normal
        "cliente": {
            "nome": customer.name,
            "cpf": customer.cpf?.replace(/\D/g, ""),
            "email": customer.email,
            "endereco": {
                "logradouro": order.shipping_address?.street || "Não informado",
                "numero": order.shipping_address?.number || "S/N",
                "bairro": order.shipping_address?.neighborhood || "Centro",
                "municipio": order.shipping_address?.city || "São Paulo",
                "uf": order.shipping_address?.state || "SP",
                "cep": order.shipping_address?.zip?.replace(/\D/g, "") || "00000000"
            }
        },
        "items": items.map((item, index) => ({
            "numero_item": index + 1,
            "codigo_produto": item.product_id,
            "descricao": item.name,
            "unidade_comercial": "UN",
            "quantidade_comercial": item.quantity,
            "valor_unitario_comercial": (item.unit_price / 100).toFixed(2),
            "valor_unitario_tributavel": (item.unit_price / 100).toFixed(2),
            "unidade_tributavel": "UN",
            "quantidade_tributavel": item.quantity,
            "cfop": "5102", // Venda dentro do estado - Simplified
            "ncm": "90041000", // Óculos de sol - Simplified default
            "icms_origem": "0",
            "icms_situacao_tributaria": "102", // Simples Nacional - Imunidade
            "valor_total": (item.unit_price * item.quantity / 100).toFixed(2)
        })),
        "valor_total": (order.total / 100).toFixed(2),
        "modalidade_frete": "9", // Sem frete
        "formas_pagamento": [
            {
                "forma_pagamento": mapPaymentMethod(order.payment_method),
                "valor_pagamento": (order.total / 100).toFixed(2)
            }
        ]
    };
}

function mapPaymentMethod(method: string) {
    switch (method) {
        case "credit_card": return "03";
        case "pix": return "17";
        case "cash": return "01";
        default: return "99";
    }
}
