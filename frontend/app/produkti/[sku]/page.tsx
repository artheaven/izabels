import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductContent from '@/components/ProductContent';
import { publicApi } from '@/lib/api';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

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

  return (
    <>
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
          <ProductContent product={product} translation={translation} />
        </div>
      </main>
      <Footer />
    </>
  );
}

