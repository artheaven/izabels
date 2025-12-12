import { Metadata } from 'next';

/**
 * Библиотека шаблонов metadata для SEO
 * Используется для генерации Title, Description, OG tags и т.д.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';
const SITE_NAME = 'Izabels Flower Shop';
const DEFAULT_LOCALE = 'bg';

/**
 * Базовые metadata для всего сайта
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'цветя Варна',
    'доставка на цветя',
    'букети',
    'флорист',
    'flowers Varna',
    'flower delivery',
    'букеты',
    'доставка цветов',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // TODO: Добавить после регистрации в Google Search Console
    // google: 'verification-code',
  },
};

/**
 * Генерация metadata для главной страницы
 */
export function generateHomeMetadata(locale: string = DEFAULT_LOCALE): Metadata {
  const titles = {
    bg: 'Доставка на цветя във Варна — Букети за Цветница, 8 март, Св. Валентин',
    en: 'Flower Delivery in Varna — Bouquets for All Occasions',
    ru: 'Доставка цветов в Варне — Букеты на все случаи жизни',
  };

  const descriptions = {
    bg: 'Поръчайте букет с доставка в рамките на 2-4 часа във Варна. Рози, лалета, кутии с цветя и подаръци. Плащане онлайн и при доставка.',
    en: 'Order fresh bouquets with 2-4 hour delivery in Varna. Roses, tulips, boxed flowers and gifts. Online and cash payment.',
    ru: 'Закажите букет с доставкой за 2-4 часа в Варне. Розы, тюльпаны, цветы в коробках и подарки. Оплата онлайн и при доставке.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.bg,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.bg,
    alternates: {
      canonical: SITE_URL,
      languages: {
        'bg': SITE_URL,
        'en': `${SITE_URL}/en`,
        'ru': `${SITE_URL}/ru`,
        'x-default': SITE_URL,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'bg' ? 'bg_BG' : locale === 'en' ? 'en_US' : 'ru_RU',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: titles[locale as keyof typeof titles] || titles.bg,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.bg,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.bg,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.bg,
      images: [`${SITE_URL}/og-image.jpg`],
    },
  };
}

/**
 * Генерация metadata для каталога
 */
export function generateCatalogMetadata(
  categoryName?: string,
  locale: string = DEFAULT_LOCALE
): Metadata {
  const baseTitle = categoryName
    ? `${categoryName} — Доставка на цветя във Варна`
    : 'Каталог — Доставка на цветя във Варна';

  const baseDescription = categoryName
    ? `Разгледайте ${categoryName.toLowerCase()} с доставка във Варна. Свежи цветя, бърза доставка 2-4 часа. Поръчайте онлайн.`
    : 'Разгледайте нашия каталог с цветя и букети. Доставка във Варна за 2-4 часа. Рози, лалета, микс букети и подаръци.';

  const canonicalUrl = categoryName
    ? `${SITE_URL}/katalog?category=${encodeURIComponent(categoryName.toLowerCase())}`
    : `${SITE_URL}/katalog`;

  return {
    title: baseTitle,
    description: baseDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'bg': canonicalUrl,
        'en': `${SITE_URL}/en/katalog`,
        'ru': `${SITE_URL}/ru/katalog`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'bg' ? 'bg_BG' : locale === 'en' ? 'en_US' : 'ru_RU',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: baseTitle,
      description: baseDescription,
      images: [
        {
          url: `${SITE_URL}/dark-moody-romantic-red-roses-bouquet-on-black-bac.jpg`,
          width: 1200,
          height: 630,
          alt: 'Каталог цветя',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description: baseDescription,
    },
  };
}

/**
 * Генерация metadata для страницы товара (PDP)
 */
export function generateProductMetadata(product: {
  sku: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  categoryName?: string;
  locale?: string;
}): Metadata {
  const locale = product.locale || DEFAULT_LOCALE;
  const title = `${product.name} — ${product.categoryName || 'Букет'} | Доставка на цветя`;
  const description =
    product.description ||
    `${product.name} с доставка във Варна. Цена ${product.price.toFixed(2)} лв. Поръчайте онлайн с доставка 2-4 часа.`;

  const productUrl = `${SITE_URL}/produkti/${product.sku}`;
  const mainImage = product.images[0] || `${SITE_URL}/placeholder.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
      languages: {
        'bg': productUrl,
        'en': `${SITE_URL}/en/produkti/${product.sku}`,
        'ru': `${SITE_URL}/ru/produkti/${product.sku}`,
      },
    },
    openGraph: {
      type: 'website', // Next.js Metadata API doesn't support 'product' type
      locale: locale === 'bg' ? 'bg_BG' : locale === 'en' ? 'en_US' : 'ru_RU',
      url: productUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: product.images
        .filter((img) => img && !img.includes('placeholder'))
        .map((img) => ({
          url: img,
          width: 1200,
          height: 1200,
          alt: product.name,
        })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
  };
}

/**
 * Генерация metadata для контактов
 */
export function generateContactsMetadata(locale: string = DEFAULT_LOCALE): Metadata {
  const titles = {
    bg: 'Контакти — Izabels Flower Shop Варна',
    en: 'Contacts — Izabels Flower Shop Varna',
    ru: 'Контакты — Izabels Flower Shop Варна',
  };

  const descriptions = {
    bg: 'Свържете се с нас: ул. Тодор Радев Пенев 13, Варна. Телефон: +359 888 110 801. Email: info@izabelsflower.com. Работно време и карта.',
    en: 'Contact us: Todor Radev Penev 13, Varna. Phone: +359 888 110 801. Email: info@izabelsflower.com. Working hours and map.',
    ru: 'Свяжитесь с нами: ул. Тодор Радев Пенев 13, Варна. Телефон: +359 888 110 801. Email: info@izabelsflower.com. Часы работы и карта.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.bg,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.bg,
    alternates: {
      canonical: `${SITE_URL}/kontakti`,
      languages: {
        'bg': `${SITE_URL}/kontakti`,
        'en': `${SITE_URL}/en/kontakti`,
        'ru': `${SITE_URL}/ru/kontakti`,
      },
    },
  };
}

/**
 * Robots meta для страниц, которые не должны индексироваться
 */
export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

