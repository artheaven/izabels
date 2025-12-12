import type { Product, Offer, OfferShippingDetails } from './types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';

/**
 * Генерация Product + Offer schema для страницы товара (PDP)
 * Включает цены, доступность, доставку
 */
export function generateProductSchema(product: {
  sku: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  priceOld?: number | null;
  category?: string;
  isActive: boolean;
  sizeVariants?: Array<{
    size: { name: string };
    price: number;
    priceOld?: number | null;
  }>;
}): Product {
  const mainImage = product.images[0] || `${SITE_URL}/placeholder.jpg`;
  const allImages = product.images.filter(img => img && !img.includes('placeholder'));

  // Если есть варианты размеров, создаем несколько Offer
  const offers: Offer[] = product.sizeVariants && product.sizeVariants.length > 0
    ? product.sizeVariants.map(variant => ({
        '@type': 'Offer',
        url: `${SITE_URL}/produkti/${product.sku}`,
        priceCurrency: 'BGN',
        price: variant.price.toFixed(2),
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 дней
        availability: product.isActive
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        shippingDetails: generateShippingDetails(),
      }))
    : [
        {
          '@type': 'Offer',
          url: `${SITE_URL}/produkti/${product.sku}`,
          priceCurrency: 'BGN',
          price: product.price.toFixed(2),
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: product.isActive
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          shippingDetails: generateShippingDetails(),
        },
      ];

  const schema: Product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/produkti/${product.sku}#product`,
    name: product.name,
    description: product.description || `${product.name} - свеж букет с доставка във Варна`,
    image: allImages.length > 0 ? allImages : [mainImage],
    sku: product.sku,
    brand: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Izabels Flower Shop',
      url: SITE_URL,
    },
    category: product.category || 'Букети',
    offers: offers.length === 1 ? offers[0] : offers,
  };

  return schema;
}

/**
 * Генерация OfferShippingDetails для Болгарии
 * Включает стоимость доставки и время
 */
function generateShippingDetails(): OfferShippingDetails {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: '6.90',
      currency: 'BGN',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'BG',
      addressRegion: 'Varna',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'HUR', // Hours
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 2,
        maxValue: 4,
        unitCode: 'HUR',
      },
    },
  };
}

/**
 * Добавление AggregateRating когда будет система отзывов
 */
export function addAggregateRating(
  schema: Product,
  rating: { ratingValue: number; reviewCount: number }
): Product {
  return {
    ...schema,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      reviewCount: rating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

