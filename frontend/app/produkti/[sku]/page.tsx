import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductContent from '@/components/ProductContent';
import { publicApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { 
  generateProductSchema, 
  generateProductBreadcrumbs,
  generateJsonLd 
} from '@/lib/structured-data';
import { generateProductMetadata } from '@/lib/metadata/templates';

export const revalidate = 3600;

/**
 * Предгенерация популярных товаров при билде
 * Остальные товары будут генерироваться on-demand
 */
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const response = await fetch(`${apiUrl}/api/products/featured?lang=bg`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    // Генерируем только популярные товары при билде
    return products.slice(0, 20).map((product: any) => ({
      sku: product.sku,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Генерация metadata для страницы товара
export async function generateMetadata({ params }: { params: { sku: string } }): Promise<Metadata> {
  try {
    const response = await publicApi.getProductBySku(params.sku, 'bg');
    const product = response.data.product;
    
    if (!product) {
      return {
        title: 'Продукт не найден',
      };
    }

    const translation = product.translations?.[0];
    const categoryName = product.category?.translations?.[0]?.name || product.category?.name || 'Букети';

    return generateProductMetadata({
      sku: product.sku,
      name: translation?.name || product.sku,
      description: translation?.description,
      price: Number(product.price),
      images: product.images || [],
      categoryName,
      locale: 'bg',
    });
  } catch (error) {
    return {
      title: 'Продукт не найден',
    };
  }
}

async function getProduct(sku: string) {
  try {
    const response = await publicApi.getProductBySku(sku, 'bg');
    return response.data.product;
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { sku: string } }) {
  const product = await getProduct(params.sku);

  if (!product) {
    notFound();
  }

  const translation = product.translations?.[0];
  const categoryName = product.category?.translations?.[0]?.name || product.category?.name || 'Букети';

  // Генерируем structured data для товара
  const productSchema = generateProductSchema({
    sku: product.sku,
    name: translation?.name || product.sku,
    description: translation?.description || undefined,
    images: product.images || [],
    price: product.price,
    priceOld: product.priceOld,
    category: categoryName,
    isActive: product.isActive ?? true,
    sizeVariants: product.sizeVariants?.map((v: any) => ({
      size: { name: v.size?.name || v.size?.translations?.[0]?.name || 'M' },
      price: Number(v.price),
      priceOld: v.priceOld ? Number(v.priceOld) : null,
    })),
  });

  const breadcrumbSchema = generateProductBreadcrumbs(
    translation?.name || product.sku,
    categoryName,
    product.sku
  );

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(productSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJsonLd(breadcrumbSchema)}
      />
      
      <Header />
      <Breadcrumbs 
        items={[
          { label: 'Каталог', href: '/katalog' },
          { label: categoryName, href: '/katalog' }
        ]} 
        currentPage={translation?.name}
      />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 pb-8">
          <ProductContent product={product} translation={translation} categoryName={categoryName} />
        </div>
      </main>
      <Footer />
    </>
  );
}
