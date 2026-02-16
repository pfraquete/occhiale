"use client";

import { useState } from "react";
import { ProductSearch } from "./product-search";
import { POSCart } from "./pos-cart";
import { CustomerSelector } from "./customer-selector";
import { createPOSOrderAction } from "@/lib/actions/pos";
import { formatCentsToBRL } from "@/lib/utils/format";
import { ShoppingBag, CreditCard, Banknote, QrCode, Loader2, CheckCircle, AlertCircle, Printer, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThermalReceipt } from "./thermal-receipt";
import { Dialog } from "@/components/ui/dialog";

interface POSContainerProps {
    storeId: string;
    initialProducts: any[];
    initialCustomers: any[];
}

export function POSContainer({ storeId, initialProducts, initialCustomers }: POSContainerProps) {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isPending, setIsPending] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [lastOrder, setLastOrder] = useState<{ id: string, number: string, items: any[] } | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [emitFiscal, setEmitFiscal] = useState(false);

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    unitPrice: product.price,
                },
            ];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const total = subtotal;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!selectedCustomer) {
            setNotification({ type: 'error', message: 'Selecione um cliente' });
            return;
        }

        setIsPending(true);
        setNotification(null);

        const result = await createPOSOrderAction({
            storeId,
            customerId: selectedCustomer.id,
            items: cart,
            paymentMethod,
            total,
        });

        setIsPending(false);

        if (result.success) {
            setNotification({ type: 'success', message: `Venda #${result.orderNumber} finalizada com sucesso!` });
            setLastOrder({
                id: result.orderId as string,
                number: result.orderNumber as string,
                items: [...cart]
            });
            setCart([]);
            setSelectedCustomer(null);
            setTimeout(() => setNotification(null), 5000);
            router.refresh();
        } else {
            setNotification({ type: 'error', message: (result.error as string) || "Erro ao processar venda" });
        }
    };

    const handlePrint = () => {
        setIsReceiptOpen(true);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Search & Items */}
            <div className="flex flex-col gap-6 lg:col-span-2 overflow-hidden">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="mb-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Busca de Produtos</h2>
                    <ProductSearch onSelect={addToCart} products={initialProducts} />
                </div>

                <div className="flex-1 rounded-2xl border border-border bg-surface p-6 overflow-hidden flex flex-col">
                    <h2 className="mb-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Carrinho</h2>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <POSCart
                            items={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Customer & Payment */}
            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="mb-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Cliente</h2>
                    <CustomerSelector
                        onSelect={setSelectedCustomer}
                        selectedCustomer={selectedCustomer}
                        customers={initialCustomers}
                    />
                </div>

                <div className="flex-1 rounded-2xl border border-border bg-surface p-6 flex flex-col">
                    <h2 className="mb-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">Pagamento</h2>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "credit_card", label: "Cartão", icon: CreditCard },
                            { id: "cash", label: "Dinheiro", icon: Banknote },
                            { id: "pix", label: "Pix", icon: QrCode },
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 py-4 transition-all ${paymentMethod === method.id
                                    ? "border-brand-500 bg-brand-50/50 text-brand-600 ring-1 ring-brand-500"
                                    : "border-border bg-bg-secondary text-text-tertiary hover:border-brand-200"
                                    }`}
                            >
                                <method.icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto space-y-3 pt-6">
                        {notification && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg border ${notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <p className="text-sm font-medium">{notification.message}</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-text-tertiary border-t border-border pt-4">
                            <span className="text-sm">Total à pagar</span>
                            <span className="text-2xl font-black text-text-primary italic font-serif">
                                {formatCentsToBRL(total)}
                            </span>
                        </div>

                        {lastOrder && (
                            <button
                                onClick={handlePrint}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-500 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-50"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir Cupom #{lastOrder.number}
                            </button>
                        )}

                        <div className="flex items-center gap-3 rounded-xl border border-border p-4 bg-bg-secondary">
                            <input
                                type="checkbox"
                                id="emit-fiscal"
                                checked={emitFiscal}
                                onChange={(e) => setEmitFiscal(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                            />
                            <label htmlFor="emit-fiscal" className="text-sm font-medium text-text-secondary cursor-pointer flex-1">
                                Emitir NFC-e (Nota Fiscal)
                            </label>
                            <FileText className={`h-4 w-4 ${emitFiscal ? 'text-brand-500' : 'text-text-tertiary'}`} />
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isPending || cart.length === 0 || !selectedCustomer}
                            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-text-primary px-8 py-4 text-white transition-all hover:bg-black disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="font-bold uppercase tracking-widest text-sm">Finalizar Venda</span>
                                    <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Dialog open={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} className="max-w-[100mm] p-0 border-none bg-transparent shadow-none">
                <div id="thermal-receipt-container" className="bg-white p-4 shadow-xl rounded-lg relative">
                    <button
                        onClick={() => setIsReceiptOpen(false)}
                        className="absolute right-2 top-2 print:hidden p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {lastOrder && (
                        <ThermalReceipt
                            orderNumber={lastOrder.number}
                            items={lastOrder.items}
                            total={lastOrder.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)}
                            paymentMethod={paymentMethod}
                            customerName={selectedCustomer?.name}
                        />
                    )}
                    <div className="mt-4 flex justify-center print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-lg bg-text-primary px-4 py-2 text-white text-sm font-bold"
                        >
                            <Printer className="h-4 w-4" />
                            Re-imprimir
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
