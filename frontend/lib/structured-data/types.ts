/**
 * TypeScript типы для Schema.org structured data
 * Используются для генерации JSON-LD на страницах
 */

export interface Organization {
  '@context': 'https://schema.org';
  '@type': 'Organization' | 'LocalBusiness' | 'Florist';
  '@id'?: string;
  name: string;
  url: string;
  logo?: string;
  image?: string[];
  description?: string;
  email?: string;
  telephone?: string;
  address?: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
  hasMerchantReturnPolicy?: MerchantReturnPolicy;
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  availableLanguage?: string[];
  email?: string;
}

export interface MerchantReturnPolicy {
  '@type': 'MerchantReturnPolicy';
  applicableCountry: string;
  returnPolicyCategory: string;
  merchantReturnDays?: number;
  returnMethod?: string;
  returnFees?: string;
}

export interface Product {
  '@context': 'https://schema.org';
  '@type': 'Product';
  '@id'?: string;
  name: string;
  description?: string;
  image?: string[];
  sku: string;
  brand?: Organization;
  category?: string;
  offers?: Offer | Offer[];
  aggregateRating?: AggregateRating;
}

export interface Offer {
  '@type': 'Offer';
  url?: string;
  priceCurrency: string;
  price: string | number;
  priceValidUntil?: string;
  availability: string;
  itemCondition?: string;
  shippingDetails?: OfferShippingDetails;
}

export interface OfferShippingDetails {
  '@type': 'OfferShippingDetails';
  shippingRate?: MonetaryAmount;
  shippingDestination?: DefinedRegion;
  deliveryTime?: ShippingDeliveryTime;
}

export interface MonetaryAmount {
  '@type': 'MonetaryAmount';
  value: string | number;
  currency: string;
}

export interface DefinedRegion {
  '@type': 'DefinedRegion';
  addressCountry: string;
  addressRegion?: string;
}

export interface ShippingDeliveryTime {
  '@type': 'ShippingDeliveryTime';
  handlingTime?: QuantitativeValue;
  transitTime?: QuantitativeValue;
}

export interface QuantitativeValue {
  '@type': 'QuantitativeValue';
  minValue: number;
  maxValue: number;
  unitCode: string; // HUR for hours, DAY for days
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface BreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface WebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description?: string;
  potentialAction?: SearchAction;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

