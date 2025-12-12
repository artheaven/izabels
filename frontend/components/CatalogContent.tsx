"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { getImageUrl } from "@/lib/api"
import { formatPrice, formatPriceEUR } from "@/lib/utils"
import { SlidersHorizontal, X, ChevronRight } from "lucide-react"

interface Product {
  id: number
  sku: string
  price: number
  priceOld: number | null
  discountPercent: number
  size: string | null
  images: string[]
  categoryName?: string
  translations: Array<{
    name: string
    description: string | null
  }>
}

interface Category {
  id: number
  name: string
  slug: string
  type?: string // BOUQUET, FLOWER, PACKAGING
  translations: Array<{
    name: string
  }>
  children: Array<{
    id: number
    name: string
    slug: string
    type?: string
    translations: Array<{
      name: string
    }>
  }>
}

interface Props {
  initialCategories: Category[]
  initialProducts: Product[]
  featuredProducts?: any[]
}

export default function CatalogContent({ initialCategories, initialProducts, featuredProducts = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceMin, setPriceMin] = useState<string>("")
  const [priceMax, setPriceMax] = useState<string>("")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts]

    if (priceMin) {
      filtered = filtered.filter((p) => Number.parseFloat(p.price.toString()) >= Number.parseFloat(priceMin))
    }
    if (priceMax) {
      filtered = filtered.filter((p) => Number.parseFloat(p.price.toString()) <= Number.parseFloat(priceMax))
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => p.size && selectedSizes.includes(p.size))
    }

    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => Number.parseFloat(a.price.toString()) - Number.parseFloat(b.price.toString()))
        break
      case "price_desc":
        filtered.sort((a, b) => Number.parseFloat(b.price.toString()) - Number.parseFloat(a.price.toString()))
        break
      case "discount":
        filtered.sort((a, b) => b.discountPercent - a.discountPercent)
        break
    }

    return filtered
  }, [initialProducts, priceMin, priceMax, selectedSizes, sortBy])

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setPriceMin("")
    setPriceMax("")
    setSelectedSizes([])
    setSortBy("newest")
  }

  return (
    <div>
      {/* Header section */}
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Цветя</h1>
        <p className="text-sm text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Открийте нашата премиум колекция цветя, създадена да внесе красота и радост във всеки повод. От елегантни
          букети до модерни аранжировки, всяка творба е внимателно оформена с най-свежите сезонни цветя. Независимо дали
          празнувате рожден ден, годишнина, романтика или просто искате да осветите деня на някого, нашите цветя правят
          всеки момент незабравим.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Филтър и сортиране</span>
          </button>

          <p className="text-sm">Показване на {filteredProducts.length} резултата</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => {
            const translation = product.translations[0]
            const hasDiscount = product.discountPercent > 0

            return (
              <Link key={product.id} href={`/produkti/${product.sku}`} className="group block">
                <div className="relative aspect-square bg-gray-200 mb-4 overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0]) || "/placeholder.svg"}
                      alt={`${translation?.name || product.sku} - ${product.price} лв с доставка`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Няма снимка
                    </div>
                  )}
                  {/* Бейджик скидки */}
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{product.discountPercent}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-gray-500 mb-1">
                    {product.categoryName || "Букети"}
                  </p>
                  <h3 className="text-base font-normal mb-1 line-clamp-2">{translation?.name || product.sku}</h3>
                  <div className="flex items-baseline gap-2">
                    {hasDiscount && product.priceOld && (
                      <span className="text-gray-400 line-through text-sm">{formatPrice(product.priceOld)}</span>
                    )}
                    <span className="text-gray-900 font-medium">{formatPrice(product.price)}</span>
                    <span className="text-gray-400 text-xs">{formatPriceEUR(product.price)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Няма намерени продукти с избраните филтри</p>
          </div>
        )}
      </div>

      {/* Sidebar overlay and panel */}
      {showFilters && (
        <>
          {/* Overlay - начинается под хедером */}
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />

          {/* Sidebar - белый фон, под хедером */}
          <div className="fixed top-16 right-0 bottom-0 w-full max-w-md bg-white z-40 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Филтър и сортиране</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Price filter */}
              <div className="border-b border-gray-200 pb-6">
                <button className="w-full flex items-center justify-between text-left font-semibold text-lg mb-4 text-gray-900">
                  <span>Цена</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Минимална цена"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="number"
                    placeholder="Максимална цена"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Category filter - только подкатегории товаров (не инвентаря) */}
              <div className="border-b border-gray-200 pb-6">
                <button className="w-full flex items-center justify-between text-left font-semibold text-lg mb-4 text-gray-900">
                  <span>Категория</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <div className="space-y-2">
                  {initialCategories
                    .filter((category) => category.type === 'BOUQUET' || !category.type)
                    .flatMap((category) => {
                      // Если есть дети - показываем подкатегории
                      if (category.children && category.children.length > 0) {
                        return category.children.map((child) => (
                          <label
                            key={child.id}
                            className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                          >
                            <input
                              type="radio"
                              name="category"
                              checked={selectedCategory === child.slug}
                              onChange={() => setSelectedCategory(child.slug)}
                              className="w-4 h-4 text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-gray-700">{child.translations[0]?.name || child.name}</span>
                          </label>
                        ))
                      }
                      // Иначе показываем саму категорию (только если это товары)
                      return (
                        <label
                          key={category.id}
                          className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.slug}
                            onChange={() => setSelectedCategory(category.slug)}
                            className="w-4 h-4 text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">{category.translations[0]?.name || category.name}</span>
                        </label>
                      )
                    })}
                </div>
              </div>

              {/* Size filter */}
              <div className="border-b border-gray-200 pb-6">
                <button className="w-full flex items-center justify-between text-left font-semibold text-lg mb-4 text-gray-900">
                  <span>Размер</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <div className="space-y-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 rounded text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div className="pb-6">
                <button className="w-full flex items-center justify-between text-left font-semibold text-lg mb-4 text-gray-900">
                  <span>Сортиране</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="newest">Най-нови</option>
                  <option value="price_asc">Цена: възходящ</option>
                  <option value="price_desc">Цена: низходящ</option>
                  <option value="discount">Първо със скидка</option>
                </select>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex space-x-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-6 py-3 border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50 transition-colors font-medium"
              >
                Изчисти всичко
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Приложи</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
