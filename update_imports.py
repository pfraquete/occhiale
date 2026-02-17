import os

REPLACEMENTS = {
    '@/lib/supabase': '@/shared/lib/supabase',
    '@/lib/utils': '@/shared/lib/utils',
    '@/lib/types': '@/shared/types',
    '@/components/ui/': '@/shared/ui/components/',
    '@/lib/actions/auth': '@/modules/core/auth/actions/auth',
    '@/hooks/use-auth': '@/modules/core/auth/hooks/use-auth',
    '@/lib/validations/auth': '@/modules/core/auth/lib/validations',
    '@/lib/actions/crm': '@/modules/core/crm/actions/crm',
    '@/components/dashboard/customers-': '@/modules/core/crm/components/customers-',
    '@/lib/pagarme': '@/modules/core/financeiro/lib/pagarme',
    '@/components/dashboard/payment-settings-info': '@/modules/core/financeiro/components/payment-settings-info',
    '@/lib/fiscal': '@/modules/core/fiscal/lib',
    '@/lib/actions/products': '@/modules/core/produtos/actions/products',
    '@/lib/actions/inventory': '@/modules/core/produtos/actions/inventory',
    '@/components/dashboard/products-': '@/modules/core/produtos/components/products-',
    '@/components/dashboard/product-': '@/modules/core/produtos/components/product-',
    '@/components/dashboard/inventory/': '@/modules/core/produtos/components/inventory/',
    '@/components/dashboard/delete-product-dialog': '@/modules/core/produtos/components/delete-product-dialog',
    '@/components/dashboard/toggle-product-switch': '@/modules/core/produtos/components/toggle-product-switch',
    '@/lib/actions/whatsapp': '@/modules/core/whatsapp/actions/whatsapp',
    '@/lib/evolution': '@/modules/core/whatsapp/lib/evolution',
    '@/components/dashboard/whatsapp': '@/modules/core/whatsapp/components/whatsapp',
    '@/components/dashboard/whatsapp-connection': '@/modules/core/whatsapp/components/whatsapp-connection',
    '@/lib/validations/whatsapp': '@/modules/core/whatsapp/lib/validations',
    '@/lib/ai': '@/modules/core/ai-agents/lib',
    '@/lib/store': '@/modules/vertical/otica/lib/store',
    '@/lib/actions/store-settings': '@/modules/vertical/otica/actions/store-settings',
    '@/lib/actions/seo-pages': '@/modules/vertical/otica/actions/seo-pages',
    '@/components/storefront': '@/modules/vertical/otica/components/storefront',
    '@/components/dashboard/pos': '@/modules/vertical/otica/components/pos',
    '@/lib/actions/checkout': '@/modules/vertical/otica/actions/checkout',
    '@/lib/actions/store': '@/modules/vertical/otica/actions/store',
    '@/lib/actions/pos': '@/modules/vertical/otica/actions/pos',
    '@/lib/actions/orders': '@/modules/vertical/otica/actions/orders',
    '@/lib/actions/service-order': '@/modules/vertical/otica/actions/service-order',
    '@/lib/validations/product': '@/modules/core/produtos/lib/validations/product',
    '@/lib/validations/checkout': '@/modules/vertical/otica/lib/validations/checkout',
    '@/lib/validations/dashboard': '@/modules/vertical/otica/lib/validations/dashboard',
    '@/lib/validations/order': '@/modules/vertical/otica/lib/validations/order',
    '@/lib/validations/prescription': '@/modules/vertical/otica/lib/validations/prescription',
    '@/lib/validations/store': '@/modules/vertical/otica/lib/validations/store',
    '@/lib/orders': '@/modules/vertical/otica/lib/orders',
    '@/lib/email': '@/shared/lib/email',
    '@/lib/meilisearch': '@/shared/lib/meilisearch',
    '@/lib/monitoring': '@/shared/lib/monitoring',
    '@/lib/push': '@/shared/lib/push',
}

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in REPLACEMENTS.items():
            new_content = new_content.replace(old, new)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    dirs_to_check = ['src', 'tests']
    extensions = ('.ts', '.tsx')
    
    for root_dir in dirs_to_check:
        if not os.path.exists(root_dir):
            continue
            
        for root, dirs, files in os.walk(root_dir):
            for file in files:
                if file.lower().endswith(extensions):
                    update_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
