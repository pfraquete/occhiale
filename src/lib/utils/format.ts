// ============================================
// OCCHIALE - Formatting Utilities (BRL / BR)
// ============================================

/**
 * Format cents (integer) to BRL currency string.
 * Example: 15990 → "R$ 159,90"
 */
export function formatCentsToBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Format CPF: 12345678901 → "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format phone: 11999887766 → "(11) 99988-7766"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Generate order number: OCH-202602-A3F8K1
 */
export function generateOrderNumber(prefix = "OCH"): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${yearMonth}-${random}`;
}

/**
 * Format CEP: 01310100 → "01310-100"
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Mask credit card number: 4111111111111111 → "**** **** **** 1111"
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Calculate installment value.
 * Returns formatted string: "3x de R$ 53,30"
 */
export function formatInstallment(
  totalCents: number,
  installments: number
): string {
  const value = Math.ceil(totalCents / installments);
  return `${installments}x de ${formatCentsToBRL(value)}`;
}
