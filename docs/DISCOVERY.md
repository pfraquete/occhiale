# Discovery — Occhiale

## Estrutura Atual
```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Rotas de autênticação (dentro de storefront?)
│   ├── (dashboard)/      # Aplicação principal
│   ├── (storefront)/     # Site/Loja pública
│   └── api/              # API Routes
├── components/
│   ├── dashboard/        # Componentes do dashboard (misturados)
│   ├── storefront/       # Componentes do site
│   └── ui/               # Componentes base (shadcn)
├── hooks/                # Custom hooks (poucos)
├── lib/                  # Lógica de negócio, utils, clients
│   ├── actions/          # Server Actions
│   ├── ai/
│   ├── fiscal/
│   ├── supabase/
│   └── ...
└── middleware.ts
```

## Dependências Principais
- `next`: 16.1.6
- `react`: 19.2.3
- `@supabase/supabase-js`: ^2.95.3
- `lucide-react`: ^0.563.0
- `zod`: ^4.3.6
- `zustand`: ^5.0.11
- `web-push`: ^3.6.7
- `meilisearch`: ^0.55.0

## Variáveis de Ambiente
(Baseado no uso no código)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAGARME_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Mapeamento por Módulo

### core/auth
- **Arquivos**:
  - `src/hooks/use-auth.ts`
  - `src/lib/actions/auth.ts`
  - `src/lib/validations/auth.ts`
  - `src/app/(storefront)/(auth)/**/*` (Páginas de login/registro)
  - `src/middleware.ts`
- **Dependências**: Supabase Auth

### core/whatsapp
- **Arquivos**:
  - `src/components/dashboard/whatsapp/**/*`
  - `src/components/dashboard/whatsapp-connection.tsx`
  - `src/lib/supabase/queries/whatsapp.ts`
  - `src/app/api/webhooks/whatsapp/**/*`
  - `src/app/(dashboard)/dashboard/whatsapp/**/*`
- **Dependências**: Evolution API (integrada via webhooks/API)

### core/ai-agents
- **Arquivos**:
  - `src/lib/ai/**/*`
  - `src/app/api/ai/**/*`
- **Nota**: Não foram encontrados componentes visuais específicos no dashboard, logicamente concentrados em `lib/ai`.

### core/crm
- **Arquivos**:
  - `src/components/dashboard/customers-*.tsx`
  - `src/lib/actions/crm.ts`
  - `src/app/api/crm/**/*`
  - `src/app/(dashboard)/dashboard/crm/**/*`

### core/financeiro
- **Arquivos**:
  - `src/components/dashboard/payment-settings-info.tsx`
  - `src/app/api/checkout/**/*` (Integração Pagar.me)
  - `src/lib/pagarme/**/*`
  - `src/app/(dashboard)/dashboard/financeiro/**/*` (se existir)
- **Nota**: A parte de "Contas a pagar/receber" precisa ser verificada se já existe ou está misturada com `admin` ou `produtos`.

### core/fiscal
- **Arquivos**:
  - `src/lib/fiscal/**/*`
  - `src/app/api/webhooks/fiscal/**/*`
  - `src/app/api/fiscal/**/*`
- **Dependências**: Focus NFe (provavelmente)

### core/produtos
- **Arquivos**:
  - `src/components/dashboard/inventory/**/*`
  - `src/components/dashboard/product-*.tsx`
  - `src/components/dashboard/products-*.tsx` (Tabelas, formulários)
  - `src/components/dashboard/toggle-product-switch.tsx`
  - `src/components/dashboard/delete-product-dialog.tsx`
  - `src/lib/supabase/queries/dashboard-products.ts`
  - `src/app/(dashboard)/dashboard/produtos/**/*`
  - `src/app/(dashboard)/dashboard/inventario/**/*`

### core/agenda
- **Arquivos**:
  - Não identificada uma pasta clara `calendar` ou `agenda` em `src/components/dashboard`.
  - **Sugestão**: Se for uma feature nova ou incipiente, criar o diretório `src/modules/core/agenda` vazio ou com o básico.

### core/site-builder
- **Arquivos**:
  - `src/components/storefront/**/*` (Todos os componentes do site)
  - `src/app/(storefront)/**/*` (Layout e páginas do site)
  - `src/app/sitemap.ts`, `src/app/robots.ts`

### core/admin
- **Arquivos**:
  - `src/components/dashboard/general-settings-*.tsx`
  - `src/components/dashboard/settings-nav.tsx`
  - `src/components/dashboard/team-members-list.tsx`
  - `src/components/dashboard/shipping-settings-form.tsx`
  - `src/lib/actions/admin.ts`
  - `src/app/(dashboard)/dashboard/admin/**/*` (ou configurações)

### vertical/otica
- **Arquivos**:
  - `src/components/dashboard/os-*.tsx` (Tabelas e status de OS)
  - `src/components/dashboard/update-os-status-form.tsx`
  - `src/lib/actions/service-order.ts`
  - `src/lib/supabase/queries/service-orders.ts`
  - `src/lib/orders/service-order-utils.ts`
  - `src/app/(dashboard)/dashboard/pedidos/**/*` (Se pedidos forem específicos de ótica/OS)

### shared/ui
- **Arquivos**: `src/components/ui/**/*` (Shadcn UI)

### shared/lib
- **Arquivos**:
  - `src/lib/supabase/**/*` (Clients)
  - `src/lib/utils/**/*`
  - `src/lib/types/**/*` (Tipos globais/database)
  - `src/lib/constants/**/*`

## Código que não se encaixa claramente / Dúvidas
1. **POS (Point of Sale)**:
   - `src/lib/actions/pos.ts`
   - `src/components/dashboard/pos/**/*`
   - **Sugestão**: Mover para `core/produtos` (se for venda de produto genérica) ou criar módulo `core/pos` se for muito complexo. Como o prompt não listou `pos`, sugiro colocar em `core/produtos` ou `core/financeiro`.

2. **Orders (não OS)**:
   - `src/lib/supabase/queries/orders.ts`
   - `src/components/dashboard/orders-*`
   - **Sugestão**: `core/produtos` (vendas) ou `core/financeiro`. Geralmente "Vendas" fica próximo de Produtos/Estoque ou Financeiro.

## Problemas encontrados
- **Estrutura Flat em Dashboard**: `src/components/dashboard` tem muitos arquivos na raiz que deveriam estar em pastas específicas (`product-form.tsx`, `customers-table.tsx`).
- **Acoplamento**: Components importam server actions e tipos diretamente de `src/lib`, o que será resolvido com a modularização.
- **Node Modules na busca**: A busca inicial incluiu `node_modules`, dificultando a análise limpa, mas os arquivos principais foram identificados.
