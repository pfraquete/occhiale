/**
 * JSON-LD Structured Data Components
 * Schema.org markup for better search engine visibility.
 */

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string[];
  brand?: string;
  sku: string;
  price: number; // in cents
  comparePrice?: number | null; // in cents
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
  storeName: string;
  priceValidUntil?: string; // ISO date string
}

export function ProductJsonLd({
  name,
  description,
  image,
  brand,
  sku,
  price,
  comparePrice,
  currency = "BRL",
  availability,
  url,
  storeName,
  priceValidUntil,
}: ProductJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: (price / 100).toFixed(2),
      priceValidUntil:
        priceValidUntil ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // eslint-disable-line react-hooks/purity
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: storeName,
      },
      ...(comparePrice
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              price: (comparePrice / 100).toFixed(2),
              priceCurrency: currency,
              valueAddedTaxIncluded: true,
            },
          }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface StoreJsonLdProps {
  name: string;
  description?: string;
  url: string;
  logo?: string;
  phone?: string;
}

export function StoreJsonLd({
  name,
  description,
  url,
  logo,
  phone,
}: StoreJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name,
    description,
    url,
    logo,
    telephone: phone,
    "@id": url,
    priceRange: "$$",
    servesCuisine: undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Catálogo ${name}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
}: OrganizationJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
