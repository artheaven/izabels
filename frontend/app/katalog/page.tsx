import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CatalogContent from '@/components/CatalogContent';
import { publicApi, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatPriceEUR } from '@/lib/utils';

export const revalidate = 0; // Always fetch fresh data
export const dynamic = 'force-dynamic';

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

  return (
    <>
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
