"use client";

import { formatCentsToBRL } from "@/lib/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptItem {
    name: string;
    quantity: number;
    unitPrice: number;
}

interface ThermalReceiptProps {
    orderNumber: string;
    items: ReceiptItem[];
    total: number;
    paymentMethod: string;
    customerName?: string;
    storeName?: string;
}

export function ThermalReceipt({
    orderNumber,
    items,
    total,
    paymentMethod,
    customerName,
    storeName = "OCCHIALE ÓTICA",
}: ThermalReceiptProps) {
    return (
        <div className="mx-auto w-[80mm] bg-white p-4 font-mono text-[12px] text-black print:m-0 print:w-full">
            {/* Header */}
            <div className="mb-4 text-center">
                <h1 className="text-[16px] font-bold uppercase">{storeName}</h1>
                <p>CNPJ: 00.000.000/0001-00</p>
                <p>Rua Exemplo, 123 - Centro</p>
                <p>(11) 99999-9999</p>
            </div>

            <div className="border-b border-dashed border-black mb-2" />

            {/* Info */}
            <div className="mb-2">
                <p>PEDIDO: {orderNumber}</p>
                <p>DATA: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                {customerName && <p>CLIENTE: {customerName}</p>}
            </div>

            <div className="border-b border-dashed border-black mb-2" />

            {/* Items */}
            <div className="mb-2">
                <div className="flex justify-between font-bold">
                    <span>ITEM</span>
                    <div className="flex gap-4">
                        <span>QTD</span>
                        <span>TOTAL</span>
                    </div>
                </div>
                {items.map((item, i) => (
                    <div key={i} className="flex flex-col mb-1">
                        <span className="uppercase">{item.name}</span>
                        <div className="flex justify-between">
                            <span>{item.quantity} x {formatCentsToBRL(item.unitPrice)}</span>
                            <span>{formatCentsToBRL(item.quantity * item.unitPrice)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b border-dashed border-black mb-2" />

            {/* Total */}
            <div className="mb-4 space-y-1">
                <div className="flex justify-between font-bold text-[14px]">
                    <span>TOTAL</span>
                    <span>{formatCentsToBRL(total)}</span>
                </div>
                <div className="flex justify-between">
                    <span>PAGAMENTO</span>
                    <span className="uppercase">
                        {paymentMethod === "credit_card" ? "CARTÃO" : paymentMethod === "cash" ? "DINHEIRO" : "PIX"}
                    </span>
                </div>
            </div>

            <div className="border-b border-dashed border-black mb-4" />

            {/* Footer */}
            <div className="text-center italic">
                <p>Obrigado pela preferência!</p>
                <p>www.occhiale.com.br</p>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt-container, #thermal-receipt-container * {
            visibility: visible;
          }
          #thermal-receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
        }
      `}</style>
        </div>
    );
}
