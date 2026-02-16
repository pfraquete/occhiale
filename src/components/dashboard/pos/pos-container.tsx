"use client";

import { useState } from "react";
import { ProductSearch } from "./product-search";
import { POSCart } from "./pos-cart";
import { CustomerSelector } from "./customer-selector";
import { createPOSOrderAction } from "@/lib/actions/pos";
import { formatCentsToBRL } from "@/lib/utils/format";
import { ShoppingBag, CreditCard, Banknote, QrCode, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
            setCart([]);
            setSelectedCustomer(null);
            setTimeout(() => setNotification(null), 5000);
            router.refresh();
        } else {
            setNotification({ type: 'error', message: result.error || "Erro ao processar venda" });
        }
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
        </div>
    );
}
