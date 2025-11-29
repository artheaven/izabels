import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { publicApi, getImageUrl } from "@/lib/api"
import Image from "next/image"
import { formatPrice, formatPriceEUR } from "@/lib/utils"

export const revalidate = 0 // Always fetch fresh data
export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
  try {
    const response = await publicApi.getFeaturedProducts("bg")
    return response.data.products.slice(0, 8) // Show up to 8 featured products
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <>
      <Header />
      <main>
        {/* Hero слайдер с видео */}
        <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_a5xiow1MxOPXnm6VYN2RD4wsnnAa/Y39TNeXx-poekYyRWUl-zO/public/10536481-hd_1366_720_25fps.mp4" type="video/mp4" />
            </video>
            {/* Overlay 30% затемнение */}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center text-white px-4">
            <p className="text-sm font-medium tracking-[0.3em] uppercase mb-4">Добре дошли</p>
            <h1 className="text-5xl md:text-6xl font-light mb-12 max-w-4xl mx-auto leading-tight">
              Ботаническата ни история започва тук.
            </h1>
            <Link
              href="/katalog"
              className="inline-block bg-gray-900 text-white px-10 py-4 rounded-sm hover:bg-gray-800 transition text-sm font-medium tracking-wider uppercase"
            >
              Разгледай всичко
            </Link>
          </div>
        </section>

        {/* Best Sellers (Featured Products) */}
        {featuredProducts.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-sm font-medium tracking-[0.2em] uppercase">Best sellers</h2>
                <p className="text-sm text-gray-500">
                  {featuredProducts.length} {featuredProducts.length === 1 ? "Продукт" : "Продукти"}
                </p>
                <Link href="/katalog" className="text-sm font-medium tracking-wide uppercase hover:underline">
                  Виж всички
                </Link>
              </div>

              {/* Product Grid - Smaller cards to fit 3+ per screen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product: any) => {
                  const translation = product.translations[0]
                  const hasDiscount = product.discountPercent > 0

                  return (
                    <Link key={product.id} href={`/produkti/${product.sku}`} className="group">
                      {/* Product Image - Smaller aspect ratio */}
                      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                        {product.images[0] ? (
                          <Image
                            src={getImageUrl(product.images[0]) || "/placeholder.svg"}
                            alt={translation?.name || product.sku}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Няма снимка
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            -{product.discountPercent}%
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <p className="text-xs font-medium tracking-wider uppercase text-gray-500">
                          {product.categoryName || product.category?.translations?.[0]?.name || product.category?.name || "Букети"}
                        </p>
                        <h3 className="font-normal text-base group-hover:underline">
                          {translation?.name || product.sku}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          {hasDiscount && product.priceOld && (
                            <span className="text-gray-400 line-through text-sm">
                              {formatPrice(product.priceOld)}
                            </span>
                          )}
                          <span className="text-gray-900 font-medium">{formatPrice(product.price)}</span>
                          <span className="text-gray-400 text-xs">{formatPriceEUR(product.price)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Популярни категории */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Букети category */}
              <Link href="/katalog/buketi" className="group relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/dark-moody-romantic-red-roses-bouquet-on-black-bac.jpg"
                  alt="Букети"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <h3 className="text-white text-4xl md:text-5xl font-light mb-6">Букети</h3>
                  <button className="self-start bg-accent text-white px-8 py-3 rounded-sm hover:bg-accent/90 transition text-sm font-medium tracking-wider uppercase">
                    Пазарувай сега
                  </button>
                </div>
              </Link>

              {/* Цветя в саксия category */}
              <Link href="/katalog/cveta-v-saksiya" className="group relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/dark-moody-green-potted-plants-and-floristry-tools.jpg"
                  alt="Цветя в саксия"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <h3 className="text-white text-4xl md:text-5xl font-light mb-6">Цветя в саксия</h3>
                  <button className="self-start bg-accent text-white px-8 py-3 rounded-sm hover:bg-accent/90 transition text-sm font-medium tracking-wider uppercase">
                    Пазарувай сега
                  </button>
                </div>
              </Link>

              {/* Подаръци category */}
              <Link href="/katalog/podaraci" className="group relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/dark-moody-elegant-gift-boxes-with-flowers-and-rib.jpg"
                  alt="Подаръци"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <h3 className="text-white text-4xl md:text-5xl font-light mb-6">Подаръци</h3>
                  <button className="self-start bg-accent text-white px-8 py-3 rounded-sm hover:bg-accent/90 transition text-sm font-medium tracking-wider uppercase">
                    Пазарувай сега
                  </button>
                </div>
              </Link>

              {/* Декорации category */}
              <Link href="/katalog/dekoracii" className="group relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/dark-moody-floral-decorations-and-dried-flowers-on.jpg"
                  alt="Декорации"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <h3 className="text-white text-4xl md:text-5xl font-light mb-6">Декорации</h3>
                  <button className="self-start bg-accent text-white px-8 py-3 rounded-sm hover:bg-accent/90 transition text-sm font-medium tracking-wider uppercase">
                    Пазарувай сега
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Wedding Bouquets Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image src="/svatba.png" alt="Сватбени букети" fill className="object-cover" />
              </div>

              {/* Right - Content */}
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-light leading-tight">
                  Луксозни сватбени букети и стилизиране
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Вашият сватбен ден заслужава нищо по-малко от цветя, които се усещат толкова незабравими, колкото
                    момента, в който казвате "Да". При Izabel's ние изработваме поръчкови булчински букети и сватбено
                    стилизиране, които улавят вашата любовна история в всяко листенце. От перфектния букет, който ще
                    носите по алеята, до спиращи дъха цветни инсталации, които трансформират вашето място, всяко
                    творение е проектирано с артистичност, внимание и романтика в основата.
                  </p>
                  <p>
                    Нашите флористи работят в тясно сътрудничество с вас, за да гарантират, че вашите цветя допълват
                    вашия стил, цветова палитра и визия - създавайки сплотена, издигната атмосфера за вашето тържество.
                  </p>
                </div>
                <Link
                  href="/svadbeni-buketi"
                  className="inline-block text-base font-medium border-b-2 border-gray-900 pb-1 hover:border-accent transition"
                >
                  Разгледайте нашето сватбено портфолио
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Our Store Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-light leading-tight">
                  Изкуството на флористиката в сърцето на София
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Izabel's не е просто магазин за цветя - това е място, където природата се среща с артистичност, а всяка
                    композиция разказва своя история. Работим само с най-свежите цветя и създаваме уникални аранжименти,
                    които превръщат всеки момент в незабравим.
                  </p>
                </div>
                <Link
                  href="/kontakti"
                  className="inline-block text-base font-medium border-b-2 border-gray-900 pb-1 hover:border-accent transition"
                >
                  Свържете се с нас
                </Link>
              </div>

              {/* Right - Image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/if-grav.png"
                  alt="Нашият магазин"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
