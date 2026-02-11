// ============================================
// OCCHIALE - Checkout API Route
// POST: validates → re-validates prices → decrements stock atomically
//       → creates customer → creates order → charges Pagar.me
//       → rollback stock on failure
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { rateLimiters } from "@/lib/utils/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { findOrCreateCustomer } from "@/lib/supabase/queries/customers";
import {
  createOrder,
  setOrderPaymentId,
  decrementStock,
  restoreStock,
} from "@/lib/supabase/queries/orders";
import type { Json } from "@/lib/types/database";
import { createPagarmeClient, PagarmeError } from "@/lib/pagarme/client";
import { generateOrderNumber } from "@/lib/utils/format";
import type {
  PagarmeOrderRequest,
  PagarmeCustomer,
  PagarmeAddress,
  PagarmeOrderItem,
  PagarmePayment,
} from "@/lib/pagarme/types";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, resetAt } = rateLimiters.checkout(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Track stock changes for rollback
  let stockDecremented = false;
  let stockItems: { productId: string; quantity: number }[] = [];

  try {
    // 1. Parse and validate body
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // 2. Re-validate product prices from DB (anti-fraud)
    const supabase = createServiceRoleClient();
    const productIds = input.items.map((i) => i.productId);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_qty, is_active, store_id")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Erro ao buscar produtos" },
        { status: 500 }
      );
    }

    // Build lookup map
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate each item
    for (const item of input.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Produto não encontrado: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Produto indisponível: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.store_id !== input.storeId) {
        return NextResponse.json(
          { error: `Produto não pertence a esta loja: ${product.name}` },
          { status: 400 }
        );
      }

      // Re-validate price matches DB
      if (product.price !== item.unitPrice) {
        return NextResponse.json(
          {
            error: `Preço alterado para ${product.name}. Atualize o carrinho.`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Calculate totals (server-side, trustworthy)
    const subtotal = input.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );

    // Get store for shipping config
    const { data: storeData } = await supabase
      .from("stores")
      .select("settings")
      .eq("id", input.storeId)
      .single();

    const storeSettings = (storeData?.settings ?? {}) as Record<
      string,
      unknown
    >;
    const shippingSettings = (storeSettings.shipping ?? {}) as Record<
      string,
      unknown
    >;
    const defaultShippingCost = (shippingSettings.defaultCost as number) ?? 0;
    const freeAbove = (shippingSettings.freeAbove as number) ?? 0;
    const isFreeShipping = freeAbove > 0 && subtotal >= freeAbove;
    const shippingCost = isFreeShipping ? 0 : defaultShippingCost;
    const total = subtotal + shippingCost;

    // 4. Atomically decrement stock BEFORE creating order
    stockItems = input.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    const { insufficientStock } = await decrementStock(stockItems);

    if (insufficientStock.length > 0) {
      // Restore stock for items that were successfully decremented
      const successfulItems = stockItems.filter(
        (item) => !insufficientStock.includes(item.productId)
      );
      if (successfulItems.length > 0) {
        await restoreStock(successfulItems);
      }

      const outOfStockNames = insufficientStock
        .map((id) => productMap.get(id)?.name ?? id)
        .join(", ");

      return NextResponse.json(
        {
          error: `Estoque insuficiente para: ${outOfStockNames}`,
        },
        { status: 400 }
      );
    }

    stockDecremented = true;

    // 5. Find or create customer
    const customer = await findOrCreateCustomer({
      storeId: input.storeId,
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      cpf: input.customer.cpf,
    });

    // 6. Generate order number and create order
    const orderNumber = generateOrderNumber();

    const orderResult = await createOrder({
      storeId: input.storeId,
      customerId: customer.id,
      orderNumber,
      subtotal,
      shippingCost,
      discount: 0,
      total,
      paymentMethod: input.paymentMethod,
      shippingAddress: {
        zipCode: input.shipping.zipCode,
        street: input.shipping.street,
        number: input.shipping.number,
        complement: input.shipping.complement ?? "",
        neighborhood: input.shipping.neighborhood,
        city: input.shipping.city,
        state: input.shipping.state,
      } as Json,
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lensConfig: (item.lensConfig as Json) ?? null,
      })),
    });

    // 7. Build Pagar.me request
    const pagarmeCustomer: PagarmeCustomer = {
      name: input.customer.name,
      email: input.customer.email,
      document: input.customer.cpf,
      document_type: "CPF",
      type: "individual",
      phones: input.customer.phone
        ? {
            mobile_phone: {
              country_code: "55",
              area_code: input.customer.phone.replace(/\D/g, "").slice(0, 2),
              number: input.customer.phone.replace(/\D/g, "").slice(2),
            },
          }
        : undefined,
    };

    const pagarmeAddress: PagarmeAddress = {
      country: "BR",
      state: input.shipping.state,
      city: input.shipping.city,
      neighborhood: input.shipping.neighborhood,
      street: input.shipping.street,
      street_number: input.shipping.number,
      complement: input.shipping.complement ?? undefined,
      zip_code: input.shipping.zipCode,
    };

    const pagarmeItems: PagarmeOrderItem[] = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        amount: item.unitPrice * item.quantity,
        description: product.name,
        quantity: item.quantity,
        code: item.productId,
      };
    });

    // Build payment payload
    let payment: PagarmePayment;

    switch (input.paymentMethod) {
      case "pix":
        payment = {
          payment_method: "pix",
          pix: {
            expires_in: 3600, // 1 hour
          },
        };
        break;

      case "boleto":
        payment = {
          payment_method: "boleto",
          boleto: {
            instructions: "Pagar até o vencimento",
            due_at: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000
            ).toISOString(), // 3 days
            document_number: orderNumber,
            type: "DM",
          },
        };
        break;

      case "credit_card": {
        if (!input.creditCard) {
          // Rollback stock since we already decremented
          await restoreStock(stockItems);
          stockDecremented = false;

          return NextResponse.json(
            { error: "Dados do cartão não informados" },
            { status: 400 }
          );
        }
        payment = {
          payment_method: "credit_card",
          credit_card: {
            installments: input.creditCard.installments,
            card: {
              number: input.creditCard.number,
              holder_name: input.creditCard.holderName,
              exp_month: input.creditCard.expMonth,
              exp_year: input.creditCard.expYear,
              cvv: input.creditCard.cvv,
              billing_address: pagarmeAddress,
            },
          },
        };
        break;
      }
    }

    const pagarmeOrder: PagarmeOrderRequest = {
      code: orderNumber,
      customer: pagarmeCustomer,
      items: pagarmeItems,
      payments: [payment],
      ...(shippingCost > 0
        ? {
            shipping: {
              amount: shippingCost,
              description: "Entrega padrão",
              address: pagarmeAddress,
            },
          }
        : {}),
    };

    // 8. Post to Pagar.me
    const pagarme = createPagarmeClient();
    let pagarmeResponse;

    try {
      pagarmeResponse = await pagarme.createOrder(pagarmeOrder);
    } catch (pagarmeError) {
      // Payment failed → rollback stock
      console.error("Pagar.me error, rolling back stock:", pagarmeError);
      await restoreStock(stockItems);
      stockDecremented = false;

      if (pagarmeError instanceof PagarmeError) {
        return NextResponse.json(
          {
            error: "Erro no processamento do pagamento",
            details: pagarmeError.message,
          },
          { status: 502 }
        );
      }
      throw pagarmeError;
    }

    // 9. Save Pagar.me order ID to our order
    await setOrderPaymentId(orderResult.orderId, pagarmeResponse.id);

    // 10. Extract payment response data
    const charge = pagarmeResponse.charges?.[0];
    const transaction = charge?.last_transaction;

    const responseData: Record<string, unknown> = {
      orderNumber: orderResult.orderNumber,
      orderId: orderResult.orderId,
      pagarmeOrderId: pagarmeResponse.id,
      paymentMethod: input.paymentMethod,
      total,
    };

    // Add payment-specific data
    if (input.paymentMethod === "pix" && transaction) {
      responseData.pix = {
        qrCode: transaction.qr_code,
        qrCodeUrl: transaction.qr_code_url,
      };
    }

    if (input.paymentMethod === "boleto" && transaction) {
      responseData.boleto = {
        url: transaction.url,
        barcode: transaction.barcode,
        line: transaction.line,
        pdf: transaction.pdf,
      };
    }

    if (input.paymentMethod === "credit_card" && charge) {
      responseData.creditCard = {
        status: charge.status,
        acquirerTid: transaction?.acquirer_tid,
      };
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);

    // Rollback stock on any unhandled error
    if (stockDecremented && stockItems.length > 0) {
      try {
        await restoreStock(stockItems);
      } catch (rollbackError) {
        console.error("CRITICAL: Failed to rollback stock:", rollbackError);
      }
    }

    if (error instanceof PagarmeError) {
      return NextResponse.json(
        {
          error: "Erro no processamento do pagamento",
          details: error.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar pedido",
      },
      { status: 500 }
    );
  }
}
