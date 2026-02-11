"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/components/storefront/store-provider";
import { formatCentsToBRL } from "@/lib/utils/format";
import { fetchAddressByCep } from "@/lib/actions/checkout";
import { ShoppingBag, MapPin, CreditCard, ClipboardCheck } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { step: 1 as Step, label: "Dados", icon: ShoppingBag },
  { step: 2 as Step, label: "Endereço", icon: MapPin },
  { step: 3 as Step, label: "Pagamento", icon: CreditCard },
  { step: 4 as Step, label: "Revisão", icon: ClipboardCheck },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { items, storeSlug } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const clearCart = useCart((s) => s.clearCart);
  const { store, settings } = useStore();

  const shippingCost = settings.shipping?.defaultCost ?? 0;
  const freeAbove = settings.shipping?.freeAbove ?? 0;
  const isFreeShipping = freeAbove > 0 && subtotal >= freeAbove;
  const shipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + shipping;

  // Form data
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });
  const [address, setAddress] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "credit_card" | "boleto"
  >("pix");
  const [creditCard, setCreditCard] = useState({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    installments: 1,
  });

  const [cepLoading, setCepLoading] = useState(false);

  async function handleCepBlur() {
    const digits = address.zipCode.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    const result = await fetchAddressByCep(digits);
    if (result) {
      setAddress((a) => ({ ...a, ...result }));
    }
    setCepLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const body = {
        storeId: store.id,
        customer: {
          ...customer,
          cpf: customer.cpf.replace(/\D/g, ""),
        },
        shipping: {
          ...address,
          zipCode: address.zipCode.replace(/\D/g, ""),
        },
        paymentMethod,
        creditCard:
          paymentMethod === "credit_card"
            ? {
                ...creditCard,
                number: creditCard.number.replace(/\D/g, ""),
                expMonth: Number(creditCard.expMonth),
                expYear: Number(creditCard.expYear),
                installments: creditCard.installments,
              }
            : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          lensConfig: item.lensConfig,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pedido");
      }

      clearCart();
      router.push(
        `/${storeSlug}/checkout/confirmacao?pedido=${data.orderNumber}&metodo=${paymentMethod}&pagarme=${data.pagarmeOrderId || ""}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Carrinho vazio</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Adicione itens antes de finalizar.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-text-primary">
        Checkout
      </h1>

      {/* Steps indicator */}
      <div className="mt-4 flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.step === currentStep;
          const isDone = s.step < currentStep;
          return (
            <div key={s.step} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 sm:w-16 ${isDone ? "bg-brand-600" : "bg-border"}`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : isDone
                      ? "bg-brand-50 text-brand-700"
                      : "bg-surface-secondary text-text-tertiary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Step 1: Customer */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Seus Dados</h2>
            <input
              name="name"
              placeholder="Nome completo"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="phone"
                placeholder="Telefone"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                name="cpf"
                placeholder="CPF (somente números)"
                value={customer.cpf}
                onChange={(e) =>
                  setCustomer({ ...customer, cpf: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!customer.name || !customer.email || !customer.cpf}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
            <input
              placeholder="CEP"
              value={address.zipCode}
              onChange={(e) =>
                setAddress({ ...address, zipCode: e.target.value })
              }
              onBlur={handleCepBlur}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {cepLoading && (
              <p className="text-xs text-text-tertiary">Buscando endereço...</p>
            )}
            <input
              placeholder="Rua"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Número"
                value={address.number}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                placeholder="Complemento"
                value={address.complement}
                onChange={(e) =>
                  setAddress({ ...address, complement: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <input
              placeholder="Bairro"
              value={address.neighborhood}
              onChange={(e) =>
                setAddress({ ...address, neighborhood: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Cidade"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                placeholder="UF"
                maxLength={2}
                value={address.state}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    state: e.target.value.toUpperCase(),
                  })
                }
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Voltar
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={
                  !address.street ||
                  !address.number ||
                  !address.city ||
                  !address.state
                }
                className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Forma de Pagamento</h2>
            <div className="space-y-2">
              {(["pix", "credit_card", "boleto"] as const).map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === method ? "border-brand-600 bg-brand-50" : "border-border hover:border-brand-300"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-brand-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {method === "pix"
                        ? "PIX"
                        : method === "credit_card"
                          ? "Cartão de Crédito"
                          : "Boleto"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {method === "pix"
                        ? "Aprovação instantânea"
                        : method === "credit_card"
                          ? "Até 12x sem juros"
                          : "Vencimento em 3 dias úteis"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === "credit_card" && (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <input
                  placeholder="Número do cartão"
                  value={creditCard.number}
                  onChange={(e) =>
                    setCreditCard({ ...creditCard, number: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <input
                  placeholder="Nome no cartão"
                  value={creditCard.holderName}
                  onChange={(e) =>
                    setCreditCard({ ...creditCard, holderName: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    placeholder="Mês"
                    value={creditCard.expMonth}
                    onChange={(e) =>
                      setCreditCard({ ...creditCard, expMonth: e.target.value })
                    }
                    className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <input
                    placeholder="Ano"
                    value={creditCard.expYear}
                    onChange={(e) =>
                      setCreditCard({ ...creditCard, expYear: e.target.value })
                    }
                    className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <input
                    placeholder="CVV"
                    value={creditCard.cvv}
                    onChange={(e) =>
                      setCreditCard({ ...creditCard, cvv: e.target.value })
                    }
                    className="rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <select
                  value={creditCard.installments}
                  onChange={(e) =>
                    setCreditCard({
                      ...creditCard,
                      installments: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatCentsToBRL(Math.ceil(total / n))}{" "}
                      {n === 1 ? "à vista" : "sem juros"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Voltar
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Revisão do Pedido</h2>

            <div className="divide-y divide-border rounded-lg border border-border">
              <div className="p-4">
                <h3 className="text-xs font-semibold uppercase text-text-tertiary">
                  Cliente
                </h3>
                <p className="mt-1 text-sm text-text-primary">
                  {customer.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {customer.email} • {customer.phone}
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-semibold uppercase text-text-tertiary">
                  Entrega
                </h3>
                <p className="mt-1 text-sm text-text-primary">
                  {address.street}, {address.number} {address.complement}
                </p>
                <p className="text-sm text-text-secondary">
                  {address.neighborhood} - {address.city}/{address.state}
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-semibold uppercase text-text-tertiary">
                  Pagamento
                </h3>
                <p className="mt-1 text-sm text-text-primary">
                  {paymentMethod === "pix"
                    ? "PIX"
                    : paymentMethod === "credit_card"
                      ? `Cartão de Crédito - ${creditCard.installments}x`
                      : "Boleto"}
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-xs font-semibold uppercase text-text-tertiary">
                  Itens ({items.length})
                </h3>
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="mt-1 flex justify-between text-sm"
                  >
                    <span className="text-text-secondary">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-text-primary">
                      {formatCentsToBRL(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>{formatCentsToBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Frete</span>
                  <span>
                    {isFreeShipping ? "Grátis" : formatCentsToBRL(shipping)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-brand-700">
                    {formatCentsToBRL(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-lg bg-accent-500 py-3 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-50"
              >
                {loading ? "Processando..." : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
