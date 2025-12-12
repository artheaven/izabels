import type { Organization, MerchantReturnPolicy } from './types';

/**
 * Генерация Organization + LocalBusiness (Florist) schema
 * Используется на главной странице и странице контактов
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';

export function generateOrganizationSchema(): Organization {
  const schema: Organization = {
    '@context': 'https://schema.org',
    '@type': 'Florist', // Специализированный тип для флористов
    '@id': `${SITE_URL}/#organization`,
    name: 'Izabels Flower Shop',
    url: SITE_URL,
    logo: `${SITE_URL}/isabels-flower-logo.svg`,
    image: [
      `${SITE_URL}/dark-moody-romantic-red-roses-bouquet-on-black-bac.jpg`,
      `${SITE_URL}/pink-flower-bouquet-in-vase.jpg`,
      `${SITE_URL}/svatba.png`,
    ],
    description:
      'Професионален магазин за цветя във Варна. Доставка на свежи букети, цветя в саксия и подаръци в цяла България. Експресна доставка за 2-4 часа.',

    // Контактная информация
    telephone: '+359888110801',
    email: 'info@izabelsflower.com',
    
    // Адрес (Варна)
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Тодор Радев Пенев 13',
      addressLocality: 'Варна',
      addressRegion: 'Варна',
      postalCode: '9000',
      addressCountry: 'BG',
    },

    // Geo-координаты (реальные координаты магазина)
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.20452,
      longitude: 27.91025,
    },

    // Часы работы
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '10:00',
        closes: '16:00',
      },
    ],

    // Ценовой диапазон
    priceRange: '29лв - 299лв',

    // Социальные сети
    sameAs: [
      'https://www.facebook.com/p/Izabels-Flower-61579199182101/',
      'https://www.instagram.com/izabelsflower/',
      'https://www.tiktok.com/@izabelsflower',
    ],

    // Контактные точки
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+359888110801',
        contactType: 'customer service',
        availableLanguage: ['Bulgarian', 'English', 'Russian'],
        email: 'info@izabelsflower.com',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+359888110801',
        contactType: 'sales',
        availableLanguage: ['Bulgarian', 'English', 'Russian'],
      },
    ],

    // Политика возврата (organization-level)
    hasMerchantReturnPolicy: generateMerchantReturnPolicy(),
  };

  return schema;
}

/**
 * Политика возврата на уровне организации
 * Отображается в сниппетах Google
 */
export function generateMerchantReturnPolicy(): MerchantReturnPolicy {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'BG',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  };
}

/**
 * WebSite schema для контроля site name в поиске
 * и потенциального search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Izabels Flower Shop',
    description: 'Доставка на цветя във Варна и цяла България',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/katalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Утилита для встраивания JSON-LD в страницу
 */
export function generateJsonLd(schema: Record<string, any>) {
  return {
    __html: JSON.stringify(schema, null, 0),
  };
}

