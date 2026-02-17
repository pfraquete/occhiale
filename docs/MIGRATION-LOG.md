# Migration Log — Occhiale Modularization

This document tracks the execution of the modularization process (Phase 2).

## [2026-02-16] — Initialization
- Created `src/modules` and `src/shared` directories.
- Updated `tsconfig.json` with path aliases.

## [2026-02-16] — Módulo: shared/ui

### Arquivos movidos:
- src/components/ui/* → src/shared/ui/components/

### Imports atualizados:
- @/components/ui/ → @/shared/ui/components/

## [2026-02-16] — Módulo: shared/lib & shared/types

### Arquivos movidos:
- src/lib/supabase/* → src/shared/lib/supabase/
- src/lib/utils/* → src/shared/lib/utils/
- src/lib/types/* → src/shared/types/

### Imports atualizados:
- @/lib/supabase → @/shared/lib/supabase
- @/lib/utils → @/shared/lib/utils
- @/lib/types → @/shared/types

## [2026-02-16] — Módulo: core/auth

### Arquivos movidos/criados:
- src/modules/core/auth/components/login-form.tsx (Extraído)
- src/modules/core/auth/components/register-form.tsx (Extraído)
- src/hooks/use-auth.ts → src/modules/core/auth/hooks/use-auth.ts
- src/lib/actions/auth.ts → src/modules/core/auth/actions/auth.ts
- src/lib/validations/auth.ts → src/modules/core/auth/lib/validations.ts
- src/modules/core/auth/index.ts (Barrel export)

### Imports atualizados:
- Páginas de auth usam componentes do módulo.
- Imports internos corrigidos.

## [2026-02-16] — Módulo: core/crm

### Arquivos movidos:
- src/lib/actions/crm.ts → src/modules/core/crm/actions/crm.ts
- src/components/dashboard/customers-*.tsx → src/modules/core/crm/components/
- src/modules/core/crm/index.ts (Barrel export)

### Imports atualizados:
- @/lib/actions/crm → @/modules/core/crm/actions/crm
- @/components/dashboard/customers-* → @/modules/core/crm/components/customers-*

## [2026-02-16] — Módulo: core/financeiro

### Arquivos movidos:
- src/lib/pagarme → src/modules/core/financeiro/lib/pagarme
- src/components/dashboard/payment-settings-info.tsx → src/modules/core/financeiro/components/
- src/modules/core/financeiro/index.ts (Barrel export)

### Imports atualizados:
- @/lib/pagarme → @/modules/core/financeiro/lib/pagarme
- @/components/dashboard/payment-settings-info → @/modules/core/financeiro/components/payment-settings-info

## [2026-02-16] — Módulo: core/fiscal

### Arquivos movidos:
- src/lib/fiscal/* → src/modules/core/fiscal/lib/
- src/modules/core/fiscal/index.ts (Barrel export)

### Imports atualizados:
- @/lib/fiscal → @/modules/core/fiscal/lib

## [2026-02-16] — Módulo: core/produtos

### Arquivos movidos:
- src/lib/actions/products.ts → src/modules/core/produtos/actions/products.ts
- src/lib/actions/inventory.ts → src/modules/core/produtos/actions/inventory.ts
- src/components/dashboard/products-*.tsx → src/modules/core/produtos/components/
- src/components/dashboard/product-*.tsx → src/modules/core/produtos/components/
- src/components/dashboard/inventory/* → src/modules/core/produtos/components/inventory/
- src/modules/core/produtos/index.ts (Barrel export)

### Imports atualizados:
- @/lib/actions/products → @/modules/core/produtos/actions/products
- @/lib/actions/inventory → @/modules/core/produtos/actions/inventory
- @/components/dashboard/products-* → @/modules/core/produtos/components/products-*
- @/components/dashboard/product-* → @/modules/core/produtos/components/product-*
- @/components/dashboard/inventory/* → @/modules/core/produtos/components/inventory/*

## [2026-02-16] — Módulos: core/whatsapp e core/ai-agents

### Arquivos movidos:
- src/lib/actions/whatsapp.ts → src/modules/core/whatsapp/actions/whatsapp.ts
- src/components/dashboard/whatsapp → src/modules/core/whatsapp/components/whatsapp
- src/components/dashboard/whatsapp-connection.tsx → src/modules/core/whatsapp/components/
- src/lib/evolution → src/modules/core/whatsapp/lib/evolution
- src/lib/validations/whatsapp.ts → src/modules/core/whatsapp/lib/validations.ts
- src/lib/ai → src/modules/core/ai-agents/lib/

### Imports atualizados:
- @/lib/actions/whatsapp → @/modules/core/whatsapp/actions/whatsapp
- @/lib/evolution → @/modules/core/whatsapp/lib/evolution
- @/components/dashboard/whatsapp → @/modules/core/whatsapp/components/whatsapp
- @/components/dashboard/whatsapp-connection → @/modules/core/whatsapp/components/whatsapp-connection
- @/lib/validations/whatsapp → @/modules/core/whatsapp/lib/validations
- @/lib/ai → @/modules/core/ai-agents/lib

## [2026-02-16] — Módulo: vertical/otica

### Arquivos movidos:
- src/lib/store.ts → src/modules/vertical/otica/lib/store.ts
- src/lib/store-settings.ts → src/modules/vertical/otica/lib/store-settings.ts
- src/lib/seo-pages.ts → src/modules/vertical/otica/lib/seo-pages.ts
- src/components/storefront → src/modules/vertical/otica/components/storefront
- src/components/dashboard/pos → src/modules/vertical/otica/components/pos
- src/lib/actions/checkout.ts → src/modules/vertical/otica/actions/checkout.ts
- src/lib/actions/store.ts → src/modules/vertical/otica/actions/store.ts
- src/lib/actions/pos.ts → src/modules/vertical/otica/actions/pos.ts
- src/lib/actions/orders.ts → src/modules/vertical/otica/actions/orders.ts
- src/lib/actions/service-order.ts → src/modules/vertical/otica/actions/service-order.ts

### Imports atualizados:
- @/lib/store → @/modules/vertical/otica/lib/store
- @/lib/store-settings → @/modules/vertical/otica/lib/store-settings
- @/lib/seo-pages → @/modules/vertical/otica/lib/seo-pages
- @/components/storefront → @/modules/vertical/otica/components/storefront
- @/components/dashboard/pos → @/modules/vertical/otica/components/pos
- @/lib/actions/checkout → @/modules/vertical/otica/actions/checkout
- @/lib/actions/store → @/modules/vertical/otica/actions/store
- @/lib/actions/pos → @/modules/vertical/otica/actions/pos
- @/lib/actions/orders → @/modules/vertical/otica/actions/orders
- @/lib/actions/service-order → @/modules/vertical/otica/actions/service-order

### Validations moved:
- src/lib/validations/product.ts → src/modules/core/produtos/lib/validations/product.ts
- src/lib/validations/{checkout,dashboard,order,prescription,store}.ts → src/modules/vertical/otica/lib/validations/

### Imports atualizados (Validations):
- @/lib/validations/product → @/modules/core/produtos/lib/validations/product
- @/lib/validations/checkout → @/modules/vertical/otica/lib/validations/checkout
- @/lib/validations/dashboard → @/modules/vertical/otica/lib/validations/dashboard
- @/lib/validations/order → @/modules/vertical/otica/lib/validations/order
- @/lib/validations/prescription → @/modules/vertical/otica/lib/validations/prescription
- @/lib/validations/store → @/modules/vertical/otica/lib/validations/store

### Limpeza de src/lib:
- src/lib/orders → src/modules/vertical/otica/lib/orders
- src/lib/email → src/shared/lib/email
- src/lib/meilisearch → src/shared/lib/meilisearch
- src/lib/monitoring → src/shared/lib/monitoring
- src/lib/push → src/shared/lib/push

### Imports atualizados (Lib Cleanup):
- @/lib/orders → @/modules/vertical/otica/lib/orders
- @/lib/email → @/shared/lib/email
- @/lib/meilisearch → @/shared/lib/meilisearch
- @/lib/monitoring → @/shared/lib/monitoring
- @/lib/push → @/shared/lib/push











