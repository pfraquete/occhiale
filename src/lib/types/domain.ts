// ============================================
// OCCHIALE - Domain Types (Optical Industry)
// Branded types for type-safe optical data
// ============================================

// === BRANDED TYPES ===
// Prevent accidental mixing of optical values

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type Sphere = Brand<number, "sphere">; // -20.00 to +20.00, step 0.25
export type Cylinder = Brand<number, "cylinder">; // -10.00 to 0.00, step 0.25
export type Axis = Brand<number, "axis">; // 0 to 180, integer
export type Addition = Brand<number, "addition">; // +0.50 to +4.00, step 0.25
export type DNP = Brand<number, "dnp">; // 45 to 80mm

// === PRESCRIPTION ===
export interface PrescriptionEye {
  sphere: Sphere;
  cylinder: Cylinder;
  axis: Axis;
}

export interface Prescription {
  id: string;
  customerId: string;
  storeId: string;
  od: PrescriptionEye; // Olho Direito
  os: PrescriptionEye; // Olho Esquerdo
  addition?: Addition;
  dnp: DNP;
  doctorName: string;
  doctorCrm?: string;
  date: string; // ISO date
  expiresAt: string; // ISO date (date + 1 year)
  imageUrl?: string;
  createdAt: string;
}

// === STORE ===
export type StorePlan = "free" | "starter" | "pro" | "enterprise";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  whatsappNumber?: string;
  plan: StorePlan;
  settings: StoreSettings;
  createdAt: string;
  ownerId: string;
}

export interface StoreSettings {
  colors?: {
    primary?: string;
    secondary?: string;
  };
  shipping?: {
    freeAbove?: number;
    defaultCost?: number;
  };
  payments?: {
    pagarmeEnabled?: boolean;
    pixEnabled?: boolean;
    creditCardEnabled?: boolean;
    boletoEnabled?: boolean;
    maxInstallments?: number; // 1-12
  };
  policies?: {
    exchange?: string;
    privacy?: string;
    terms?: string;
  };
}

// === PRODUCT ===
export type ProductCategory =
  | "oculos-grau"
  | "oculos-sol"
  | "lentes-contato"
  | "acessorios"
  | "infantil";

export type FrameShape =
  | "redondo"
  | "quadrado"
  | "retangular"
  | "aviador"
  | "gatinho"
  | "oval"
  | "hexagonal"
  | "clubmaster";

export type FrameMaterial = "acetato" | "metal" | "titanio" | "misto" | "nylon";

export type FaceShape = "oval" | "redondo" | "quadrado" | "coracao" | "oblongo";

export interface Product {
  id: string;
  storeId: string;
  sku?: string;
  name: string;
  descriptionSeo: string;
  price: number; // in cents (BRL)
  comparePrice?: number; // original price for discounts
  category: ProductCategory;
  brand: string;
  model?: string;
  images: string[];
  specs: ProductSpecs;
  stockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecs {
  frameShape?: FrameShape;
  frameMaterial?: FrameMaterial;
  frameColor?: string;
  frameWidth?: number; // mm
  bridgeWidth?: number; // mm
  templeLength?: number; // mm
  lensWidth?: number; // mm
  lensHeight?: number; // mm
  weight?: number; // grams
  uvProtection?: boolean;
  polarized?: boolean;
  idealFaceShapes?: FaceShape[];
  gender?: "masculino" | "feminino" | "unissex" | "infantil";
}

// === CUSTOMER ===
export interface Customer {
  id: string;
  storeId: string;
  name: string;
  email?: string;
  phone?: string;
  faceShape?: FaceShape;
  preferences: CustomerPreferences;
  ltv: number; // lifetime value in cents
  lastPurchaseAt?: string;
  npsScore?: number;
  engagementScore?: number; // 0-100
  createdAt: string;
}

export interface CustomerPreferences {
  favoriteBrands?: string[];
  favoriteStyles?: FrameShape[];
  preferredColors?: string[];
  contactChannel?: "whatsapp" | "email" | "sms";
}

// === ORDER ===
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod =
  | "pix"
  | "credit_card"
  | "debit_card"
  | "boleto"
  | "whatsapp";

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  status: OrderStatus;
  total: number; // cents
  subtotal: number; // cents
  shippingCost: number; // cents
  discount: number; // cents
  paymentMethod: PaymentMethod;
  shippingStatus?: string;
  trackingCode?: string;
  whatsappThreadId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number; // cents
  lensConfig?: LensConfig;
}

export interface LensConfig {
  type: "sem-grau" | "monofocal" | "bifocal" | "progressiva" | "sol";
  material?: "resina" | "policarbonato" | "trivex" | "alto-indice";
  treatments?: (
    | "antirreflexo"
    | "fotocromática"
    | "filtro-azul"
    | "polarizada"
  )[];
  prescriptionId?: string;
}

// === WHATSAPP ===
export type AgentState =
  | "idle"
  | "greeting"
  | "consulting"
  | "quoting"
  | "closing"
  | "post_sale"
  | "escalated_human";

export interface WhatsAppConversation {
  id: string;
  storeId: string;
  customerId?: string;
  phone: string;
  agentState: AgentState;
  sentiment?: "positive" | "neutral" | "negative";
  lastMessageAt: string;
  isEscalated: boolean;
  createdAt: string;
}

// === SEO ===
export type SeoPageType =
  | "product"
  | "category"
  | "brand"
  | "guide"
  | "comparison"
  | "local"
  | "blog";

export interface SeoPage {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  metaDesc: string;
  h1: string;
  contentHtml: string;
  schemaJson: Record<string, unknown>;
  pageType: SeoPageType;
  publishedAt?: string;
  createdAt: string;
}

// === CRM AUTOMATION ===
export type AutomationTrigger =
  | "post_purchase_24h"
  | "post_purchase_7d"
  | "post_purchase_30d"
  | "birthday"
  | "prescription_12m"
  | "prescription_18m"
  | "contact_lens_cycle"
  | "inactivity_6m"
  | "nps_detractor";

export type AutomationAction =
  | "send_whatsapp"
  | "send_email"
  | "send_sms"
  | "alert_manager"
  | "create_coupon"
  | "start_agent_flow";

export interface CrmAutomation {
  id: string;
  storeId: string;
  triggerType: AutomationTrigger;
  delayHours: number;
  actionType: AutomationAction;
  templateId?: string;
  conditions?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}
