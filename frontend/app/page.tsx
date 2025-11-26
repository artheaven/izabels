import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { publicApi, getImageUrl } from '@/lib/api';
import Image from 'next/image';
import { formatPrice, formatPriceEUR } from '@/lib/utils';

export const revalidate = 3600; // Revalidate every hour

async function getSpecialOffers() {
  try {
    const response = await publicApi.getProducts({ 
      sort: 'discount',
      lang: 'bg' 
    });
    return response.data.products.slice(0, 4);
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return [];
  }
}

export default async function HomePage() {
  const specialOffers = await getSpecialOffers();

  return (
    <>
      <Header />
      <main>
        {/* Hero слайдер */}
        <section className="relative h-[500px] bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">
                Свежи букети за всеки повод
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Професионални флористични композиции с доставка в София
              </p>
              <Link
                href="/katalog"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition text-lg font-semibold"
              >
                Разгледай каталога
              </Link>
            </div>
          </div>
        </section>

        {/* Популярни категории */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Популярни категории
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['Романтични букети', 'Луксозни букети', 'Букети за рожден ден'].map(
                (category, index) => (
                  <Link
                    key={index}
                    href="/katalog"
                    className="group relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gray-200" />
                    <h3 className="absolute bottom-4 left-4 right-4 text-white text-2xl font-bold z-20">
                      {category}
                    </h3>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* Специални предложения */}
        {specialOffers.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                Специални предложения
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialOffers.map((product: any) => {
                  const translation = product.translations[0];
                  const hasDiscount = product.discountPercent > 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/produkti/${product.sku}`}
                      className="group bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        {product.images[0] ? (
                          <Image
                            src={getImageUrl(product.images[0])}
                            alt={translation?.name || product.sku}
                            fill
                            className="object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Няма снимка
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            -{product.discountPercent}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {translation?.name || product.sku}
                        </h3>
                        <div>
                          {hasDiscount && product.priceOld && (
                            <div className="mb-1">
                              <span className="text-gray-400 line-through text-sm block">
                                {formatPrice(product.priceOld)}
                              </span>
                              <span className="text-gray-400 line-through text-xs block">
                                {formatPriceEUR(product.priceOld)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-primary font-bold text-xl block">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-primary/70 text-sm block">
                              {formatPriceEUR(product.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

