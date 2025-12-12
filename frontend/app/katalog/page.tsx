import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CatalogContent from '@/components/CatalogContent';
import { publicApi, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { generateCatalogBreadcrumbs, generateJsonLd } from '@/lib/structured-data';
import { generateCatalogMetadata } from '@/lib/metadata/templates';
import { getFacetedRobotsMeta, getFacetedCanonicalUrl } from '@/lib/seo/faceted-navigation';

export const revalidate = 1800; // ISR: обновлять каждые 30 минут
export const dynamic = 'force-static';

// Генерация metadata для каталога с учетом фильтров
export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  
  // Определяем robots meta на основе фильтров
  const robotsMeta = getFacetedRobotsMeta(params);
  
  // Определяем canonical URL
  const canonicalUrl = getFacetedCanonicalUrl('https://izabels.bg/katalog', params);
  
  const categoryName = typeof searchParams.category === 'string' 
    ? searchParams.category 
    : undefined;
  
  return {
    ...generateCatalogMetadata(categoryName, 'bg'),
    robots: robotsMeta,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

async function getCategories() {
  try {
    const response = await publicApi.getCategories('bg');
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getProducts() {
  try {
    const response = await publicApi.getProducts({ lang: 'bg' });
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const response = await publicApi.getFeaturedProducts('bg');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export default async function CatalogPage() {
  const [categories, products, featuredProducts] = await Promise.all([
    getCategories(),
    getProducts(),
    getFeaturedProducts(),
  ]);

  // Генерируем breadcrumb schema для каталога
  const breadcrumbSchema = generateCatalogBreadcrumbs();

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)}
      />
      
      <Header />
      <Breadcrumbs currentPage="Каталог" />
      <main className="min-h-screen">
        <CatalogContent 
          initialCategories={categories} 
          initialProducts={products}
          featuredProducts={featuredProducts}
        />
      </main>
      <Footer />
    </>
  );
}
