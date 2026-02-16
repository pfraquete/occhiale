"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, XCircle, Loader2 } from "lucide-react";
import { formatCentsToBRL } from "@/lib/utils/format";

interface FiscalDetailsProps {
    orderId: string;
    fiscalStatus: string;
    fiscalKey?: string;
    fiscalNumber?: number;
    fiscalPdfUrl?: string;
    fiscalXmlUrl?: string;
}

export function FiscalDetails({
    orderId,
    fiscalStatus,
    fiscalKey,
    fiscalNumber,
    fiscalPdfUrl,
    fiscalXmlUrl,
}: FiscalDetailsProps) {
    const [isPending, setIsPending] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "authorized": return "bg-green-100 text-green-700 border-green-200";
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "denied": return "bg-red-100 text-red-700 border-red-200";
            case "cancelled": return "bg-gray-100 text-gray-700 border-gray-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "authorized": return "Autorizada";
            case "pending": return "Processando";
            case "denied": return "Rejeitada";
            case "cancelled": return "Cancelada";
            default: return "Não Emitida";
        }
    };

    if (fiscalStatus === "none") return null;

    return (
        <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">Documento Fiscal</h3>
                <Badge className={getStatusColor(fiscalStatus)} variant="outline">
                    {getStatusLabel(fiscalStatus)}
                </Badge>
            </div>

            <div className="space-y-3">
                {fiscalNumber && (
                    <div className="flex justify-between text-sm">
                        <span className="text-text-tertiary">Número / Série:</span>
                        <span className="font-medium text-text-primary">#{fiscalNumber} / 1</span>
                    </div>
                )}

                {fiscalKey && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-tertiary">Chave de Acesso:</span>
                        <span className="text-[10px] font-mono break-all bg-bg-secondary p-2 rounded border border-border">
                            {fiscalKey}
                        </span>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    {fiscalPdfUrl && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => window.open(fiscalPdfUrl, "_blank")}
                        >
                            <FileText className="h-4 w-4" />
                            DANFE
                        </Button>
                    )}
                    {fiscalXmlUrl && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 gap-2 text-xs"
                            onClick={() => window.open(fiscalXmlUrl, "_blank")}
                        >
                            <Download className="h-4 w-4" />
                            XML
                        </Button>
                    )}
                </div>

                {fiscalStatus === "authorized" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                        disabled={isPending}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancelar Nota
                    </Button>
                )}
            </div>
        </div>
    );
}
