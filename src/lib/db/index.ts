// ============================================================================
// Database Layer - Barrel Export
// ============================================================================
//
// /lib/db centralizes all database query functions.
// Import queries from here instead of reaching into deep paths.
//
// Usage:
//   import { getFilteredProducts, getOrders } from '@/lib/db';
// ============================================================================

// Analytics
export {
  getDailySales,
  getTopProducts,
  getPaymentMethodBreakdown,
  getOrderStatusBreakdown,
  getCustomerGrowth,
  getConversionMetrics,
  getLifetimeValue,
  getRepeatPurchaseRate,
} from "@/shared/lib/supabase/queries/analytics";

// Customers (storefront)
export {
  findOrCreateCustomer,
  getCustomerByUserId,
} from "@/shared/lib/supabase/queries/customers";

// Dashboard Customers
export {
  getCustomers,
  getCustomerById,
  getCustomerOrders,
  getCustomerPrescriptions,
} from "@/shared/lib/supabase/queries/dashboard-customers";

// Dashboard Orders
export {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "@/shared/lib/supabase/queries/dashboard-orders";

// Dashboard Products
export {
  getProducts,
  getProductById as getDashboardProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from "@/shared/lib/supabase/queries/dashboard-products";

// Dashboard Store
export {
  getStoreSettings,
  updateStoreSettings,
  getStoreMembers,
  removeStoreMember,
} from "@/shared/lib/supabase/queries/dashboard-store";

// Dashboard Stats
export {
  getDashboardStats,
  getRecentOrders,
  getUserStoreWithRole,
} from "@/shared/lib/supabase/queries/dashboard";

// Inventory
export {
  getInventoryMovements,
  getProductBatches,
  getABCAnalysis,
  addInventoryMovement,
  createInventoryBatch,
  getExpiringBatchesCount,
} from "@/shared/lib/supabase/queries/inventory";

// Storefront Orders
export {
  createOrder,
  getOrderByNumber,
  updateOrderPayment,
  getOrderByPaymentId,
} from "@/shared/lib/supabase/queries/orders";

// Storefront Products
export {
  getFilteredProducts,
  getProductById,
  getRelatedProducts,
  getBrandsForStore,
} from "@/shared/lib/supabase/queries/products";

// Service Orders
export {
  getServiceOrders,
  getServiceOrderById,
  updateServiceOrderStatus,
  createServiceOrder,
} from "@/shared/lib/supabase/queries/service-orders";

// Stores
export {
  getStoreBySlug,
  getFeaturedProducts,
} from "@/shared/lib/supabase/queries/stores";

// WhatsApp
export {
  findOrCreateConversation,
  getConversationById,
  getConversationsForStore,
  updateConversationState,
  saveMessage,
  getConversationHistory,
  getMessagesForConversation,
} from "@/shared/lib/supabase/queries/whatsapp";
