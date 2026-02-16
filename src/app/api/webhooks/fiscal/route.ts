import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supabase = createServiceRoleClient();

        // Focus NFe webhook structure
        const {
            ref,
            status,
            chave_nfe,
            numero,
            caminho_xml_nota_fiscal,
            caminho_danfe,
            mensagem_sefaz
        } = body;

        // Map Focus NFe status to ours
        let fiscalStatus = "none";
        if (status === "autorizado") fiscalStatus = "authorized";
        else if (status === "erro_autorizacao") fiscalStatus = "denied";
        else if (status === "cancelado") fiscalStatus = "cancelled";
        else if (status === "processando_autorizacao") fiscalStatus = "pending";

        // Update order
        const { error } = await supabase
            .from("orders")
            .update({
                fiscal_status: fiscalStatus,
                fiscal_key: chave_nfe,
                fiscal_number: numero,
                fiscal_xml_url: caminho_xml_nota_fiscal,
                fiscal_pdf_url: caminho_danfe,
                notes: mensagem_sefaz ? `SEFAZ: ${mensagem_sefaz}` : undefined
            })
            .eq("order_number", ref);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Fiscal Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
