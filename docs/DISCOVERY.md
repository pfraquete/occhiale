# Discovery — Occhiale

## Estrutura Atual

Estrutura resumida (foco em código-fonte):

- `src/app/`
  - `(storefront)/`: landing pública, catálogo, checkout, auth de cliente
  - `(dashboard)/dashboard/`: páginas do painel operacional (CRM, WhatsApp, pedidos, produtos, SEO, etc.)
  - `api/`: rotas de integração (`ai`, `checkout`, `crm`, `meilisearch`, `push`, `webhooks`, `whatsapp`, etc.)
  - `layout.tsx`, `globals.css`, tratamento global de erros/SEO
- `src/components/`
  - `ui/`: design system (shadcn + componentes base)
  - `dashboard/`: componentes de dashboard por domínio
  - `storefront/`: componentes da experiência de loja pública
  - `analytics/`, `seo/`, `pwa/`, `lgpd/`
- `src/lib/`
  - `actions/`: server actions por domínio
  - `supabase/`: clientes, middleware e queries
  - `ai/`, `evolution/`, `fiscal/`, `meilisearch/`, `pagarme/`, `push/`, `email/`
  - `types/`, `utils/`, `validations/`, `orders/`, `store/`, `monitoring/`
- `src/hooks/`: hooks de estado/sessão e integrações client-side
- `src/middleware.ts`: middleware de autenticação/autorização
- `supabase/migrations/`: schema e funções SQL
- `tests/`: testes unitários e de integração

## Dependências Principais

Principais dependências (`package.json`):

- `next@16.1.6`, `react@19.2.3`, `react-dom@19.2.3`
- `@supabase/supabase-js@2.95.3`, `@supabase/ssr@0.8.0`
- `@anthropic-ai/sdk@0.74.0`
- `meilisearch@0.55.0`
- `web-push@3.6.7`
- `@tanstack/react-table@8.21.3`
- `react-hook-form@7.71.1`, `@hookform/resolvers@5.2.2`, `zod@4.3.6`
- `recharts@3.7.0`, `date-fns@4.1.0`
- `lucide-react@0.563.0`, `next-themes@0.4.6`
- `zustand@5.0.11`, `nuqs@2.8.8`

## Variáveis de Ambiente

Variáveis detectadas por uso no código (apenas nomes):

- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `EVOLUTION_API_KEY`
- `EVOLUTION_API_URL`
- `MEILISEARCH_ADMIN_KEY`
- `MEILISEARCH_API_KEY`
- `MEILISEARCH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MEILISEARCH_HOST`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`
- `NODE_ENV`
- `PAGARME_SECRET_KEY`
- `PAGARME_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Mapeamento por Módulo

### core/auth

- **Arquivos**:
  - `src/lib/actions/auth.ts`
  - `src/lib/validations/auth.ts`
  - `src/hooks/use-auth.ts`
  - `src/lib/supabase/middleware.ts`
  - `src/middleware.ts`
  - `src/app/(storefront)/(auth)/**`
- **Dependências externas**: `@supabase/ssr`, `@supabase/supabase-js`, `next`
- **Depende de**: `core/database`, `core/utils`, `core/ui`

### core/whatsapp

- **Arquivos**:
  - `src/lib/actions/whatsapp.ts`
  - `src/lib/evolution/{client.ts,types.ts,webhook.ts,notifications.ts}`
  - `src/lib/supabase/queries/whatsapp.ts`
  - `src/lib/validations/whatsapp.ts`
  - `src/hooks/use-realtime-messages.ts`
  - `src/components/dashboard/whatsapp/**`
  - `src/components/storefront/whatsapp-fab.tsx`
  - `src/app/(dashboard)/dashboard/whatsapp/**`
  - `src/app/(dashboard)/dashboard/configuracoes/whatsapp/page.tsx`
  - `src/app/api/whatsapp/**`
  - `src/app/api/webhooks/evolution/route.ts`
- **Dependências externas**: Evolution API (HTTP), Supabase Realtime
- **Depende de**: `core/database`, `core/auth`, `core/crm`, `core/ai-agents`, `core/ui`

### core/ai-agents

- **Arquivos**:
  - `src/lib/ai/**`
  - `src/app/api/ai/**`
  - `src/components/dashboard/whatsapp/{agent-state-badge.tsx,sentiment-indicator.tsx}`
- **Dependências externas**: `@anthropic-ai/sdk`
- **Depende de**: `core/whatsapp`, `core/crm`, `core/produtos`, `vertical/otica`, `core/utils`

### core/crm

- **Arquivos**:
  - `src/lib/actions/crm.ts`
  - `src/lib/supabase/queries/{customers.ts,dashboard-customers.ts}`
  - `src/app/(dashboard)/dashboard/crm/**`
  - `src/app/(dashboard)/dashboard/clientes/**`
  - `src/components/dashboard/{customers-table.tsx,customers-filters.tsx}`
  - `src/app/api/crm/process/route.ts`
- **Dependências externas**: Supabase
- **Depende de**: `core/database`, `core/auth`, `core/ui`

### core/financeiro

- **Arquivos**:
  - `src/lib/pagarme/**`
  - `src/lib/actions/checkout.ts`
  - `src/app/api/checkout/route.ts`
  - `src/app/api/webhooks/pagarme/route.ts`
  - `src/app/(dashboard)/dashboard/configuracoes/pagamentos/page.tsx`
  - `src/components/dashboard/payment-settings-info.tsx`
- **Dependências externas**: Pagar.me API
- **Depende de**: `core/database`, `core/auth`, `core/utils`

### core/fiscal

- **Arquivos**:
  - `src/lib/fiscal/focus-nfe.ts`
  - `src/app/api/webhooks/fiscal/route.ts`
  - `src/components/dashboard/orders/fiscal-details.tsx`
- **Dependências externas**: Focus NFe/API fiscal
- **Depende de**: `core/database`, `core/financeiro`, `core/utils`

### core/produtos

- **Arquivos**:
  - `src/lib/actions/products.ts`
  - `src/lib/supabase/queries/products.ts`
  - `src/lib/validations/product.ts`
  - `src/components/dashboard/{products-table.tsx,products-filters.tsx,product-form.tsx,product-actions-dropdown.tsx,toggle-product-switch.tsx,delete-product-dialog.tsx}`
  - `src/app/(dashboard)/dashboard/produtos/**`
- **Dependências externas**: Supabase Storage
- **Depende de**: `core/database`, `core/ui`, `core/utils`

### core/agenda

- **Arquivos**:
  - Não há módulo explícito de agenda com calendário/agendamento dedicado nesta base.
  - Possível embrião: fluxos de acompanhamento em CRM/WhatsApp.
- **Dependências externas**: N/A
- **Depende de**: N/A

### core/site-builder

- **Arquivos**:
  - `src/lib/actions/seo-pages.ts`
  - `src/app/(storefront)/[slug]/p/[pageSlug]/page.tsx`
  - `src/app/(dashboard)/dashboard/seo/**`
  - `src/components/seo/json-ld.tsx`
- **Dependências externas**: Supabase
- **Depende de**: `core/database`, `core/admin`, `core/ui`

### core/admin

- **Arquivos**:
  - `src/lib/actions/{store.ts,store-settings.ts}`
  - `src/lib/store/provisioning.ts`
  - `src/lib/supabase/queries/stores.ts`
  - `src/app/(dashboard)/dashboard/configuracoes/**`
  - `src/components/dashboard/{general-settings-form.tsx,shipping-settings-form.tsx,team-members-list.tsx,settings-nav.tsx}`
- **Dependências externas**: Supabase
- **Depende de**: `core/auth`, `core/database`, `core/ui`

### core/ui

- **Arquivos**:
  - `src/components/ui/**`
  - `src/components/dashboard/{dashboard-sidebar.tsx,dashboard-header.tsx,mobile-sidebar.tsx,sidebar-nav-item.tsx,sidebar-nav-items.ts}`
  - `src/components/dashboard/{stats-card.tsx,stats-cards.tsx,empty-dashboard.tsx}`
- **Dependências externas**: shadcn/ui primitives, `lucide-react`, `class-variance-authority`
- **Depende de**: `core/utils`

### core/utils

- **Arquivos**:
  - `src/lib/utils/**`
  - `src/lib/validations/**`
  - `src/lib/monitoring/{logger.ts,sentry.ts}`
- **Dependências externas**: `zod`, `next`
- **Depende de**: `core/types`

### core/database

- **Arquivos**:
  - `src/lib/supabase/{client.ts,server.ts,admin.ts,middleware.ts}`
  - `src/lib/supabase/queries/**`
  - `src/lib/types/{database.ts,domain.ts,inventory.ts,index.ts}`
  - `supabase/migrations/**`
- **Dependências externas**: Supabase
- **Depende de**: `core/utils`

### vertical/otica

- **Arquivos**:
  - `src/lib/ai/{prescription-ocr.ts,face-measurement.ts,lens-calibration.ts,product-recognition.ts}`
  - `src/lib/ai/tools/{analyze-prescription.ts,recommend-frames.ts,calculate-lens.ts}`
  - `src/lib/validations/prescription.ts`
  - `src/app/(storefront)/[slug]/{medir-rosto,calibrar-lente}/**`
  - `src/components/dashboard/os-table.tsx`
  - `src/components/dashboard/{update-os-status-form.tsx,os-status-badge.tsx}`
  - `src/lib/actions/service-order.ts`
  - `src/lib/orders/service-order-utils.ts`
  - `src/app/(dashboard)/dashboard/ordens-servico/**`
- **Dependências externas**: Anthropic SDK, storage de mídia
- **Depende de**: `core/produtos`, `core/crm`, `core/database`, `core/ui`

### shared/layout

- **Arquivos**:
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/dashboard/{dashboard-sidebar.tsx,dashboard-header.tsx,mobile-sidebar.tsx,dashboard-provider.tsx}`
- **Dependências externas**: Next.js App Router
- **Depende de**: `core/auth`, `core/admin`, `core/ui`

### landing

- **Arquivos**:
  - `src/app/(storefront)/page.tsx`
  - `src/components/storefront/**`
  - `src/app/(storefront)/{privacidade,termos}/page.tsx`
- **Dependências externas**: Next.js
- **Depende de**: `core/produtos`, `core/crm`, `core/whatsapp`, `core/ui`

## Código que não se encaixa em nenhum módulo

- `src/lib/meilisearch/**`: pode virar `core/search` (novo módulo reutilizável).
- `src/lib/push/sender.ts`, `src/hooks/use-push-notifications.ts`, `src/components/pwa/sw-register.tsx`, `src/app/api/push/subscribe/route.ts`: pode virar `core/notifications`.
- `src/lib/email/**`: pode virar `core/communications`.
- `src/components/analytics/posthog-provider.tsx`: pode virar `shared/analytics`.
- `src/components/lgpd/cookie-banner.tsx` + `src/app/api/lgpd/delete-data/route.ts`: pode virar `core/compliance`.

## Problemas encontrados

1. **Acoplamento entre domínio e interface**
   - Componentes de `dashboard/whatsapp` incorporam estado de agente de IA e regras de negócio.
2. **Módulos ainda não explícitos**
   - Agenda, fiscal e financeiro estão parcialmente distribuídos em actions/queries/apis sem fronteira clara.
3. **Lógica vertical misturada no core**
   - Fluxos de receituário/calibração/medição estão dentro de `src/lib/ai` junto de capacidades potencialmente reutilizáveis.
4. **Pages com lógica além de roteamento**
   - Existem páginas com composição e busca de dados acopladas ao `app/`, contrariando a meta de “páginas finas”.
5. **Ausência de barrel exports por domínio**
   - Imports tendem a atravessar diretórios concretos (`lib/...`, `components/...`) sem contratos modulares.
6. **Nomenclatura de domínio heterogênea**
   - Mistura de português/inglês (`clientes`, `orders`, `store`, `whatsapp`) dificulta padronização para extração futura.

---

**Status da Fase 1 (Discovery): concluída.**

Conforme solicitado, a execução deve parar aqui e seguir para aprovação antes da Fase 2.
