import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogContent from '@/components/CatalogContent';
import { publicApi, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatPriceEUR } from '@/lib/utils';

export const revalidate = 1800; // 30 minutes

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
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Каталог</h1>

          <CatalogContent 
            initialCategories={categories} 
            initialProducts={products}
            featuredProducts={featuredProducts}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

