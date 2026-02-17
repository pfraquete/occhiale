// ============================================
// OCCHIALE - Pagar.me API v5 Types
// ============================================

// --- Request Types ---

export interface PagarmeCustomer {
  name: string;
  email: string;
  document: string; // CPF (11 digits)
  document_type: "CPF";
  type: "individual";
  phones?: {
    mobile_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
}

export interface PagarmeAddress {
  country: "BR";
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  street_number: string;
  complement?: string;
  zip_code: string;
}

export interface PagarmeOrderItem {
  amount: number; // cents
  description: string;
  quantity: number;
  code: string; // product ID
}

// --- Payment Types ---

export interface PagarmePixPayment {
  payment_method: "pix";
  pix: {
    expires_in: number; // seconds (e.g., 3600 = 1h)
  };
}

export interface PagarmeCreditCardPayment {
  payment_method: "credit_card";
  credit_card: {
    installments: number;
    card: {
      number: string;
      holder_name: string;
      exp_month: number;
      exp_year: number;
      cvv: string;
      billing_address: PagarmeAddress;
    };
  };
}

export interface PagarmeBoletoPayment {
  payment_method: "boleto";
  boleto: {
    instructions: string;
    due_at: string; // ISO date
    document_number: string;
    type: "DM"; // Duplicata Mercantil
  };
}

export type PagarmePayment =
  | PagarmePixPayment
  | PagarmeCreditCardPayment
  | PagarmeBoletoPayment;

// --- Order Request ---

export interface PagarmeOrderRequest {
  code: string; // our order_number
  customer: PagarmeCustomer;
  items: PagarmeOrderItem[];
  payments: PagarmePayment[];
  shipping?: {
    amount: number;
    description: string;
    address: PagarmeAddress;
  };
}

// --- Response Types ---

export interface PagarmeCharge {
  id: string;
  code: string;
  amount: number;
  status: PagarmeChargeStatus;
  payment_method: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  last_transaction?: PagarmeTransaction;
}

export type PagarmeChargeStatus =
  | "pending"
  | "processing"
  | "paid"
  | "canceled"
  | "failed"
  | "overpaid"
  | "underpaid"
  | "chargedback";

export interface PagarmeTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  // PIX specific
  qr_code?: string;
  qr_code_url?: string;
  // Boleto specific
  url?: string;
  barcode?: string;
  line?: string;
  pdf?: string;
  // Credit Card
  acquirer_tid?: string;
}

export interface PagarmeOrderResponse {
  id: string;
  code: string;
  amount: number;
  status: string;
  charges: PagarmeCharge[];
  customer: PagarmeCustomer;
  created_at: string;
  updated_at: string;
}

// --- Webhook Types ---

export interface PagarmeWebhookEvent {
  id: string;
  type: PagarmeWebhookType;
  created_at: string;
  data: {
    id: string;
    code: string;
    amount: number;
    status: string;
    charges?: PagarmeCharge[];
    [key: string]: unknown;
  };
}

export type PagarmeWebhookType =
  | "order.paid"
  | "order.payment_failed"
  | "order.canceled"
  | "charge.paid"
  | "charge.payment_failed"
  | "charge.refunded"
  | "charge.chargedback"
  | "charge.underpaid"
  | "charge.overpaid";
