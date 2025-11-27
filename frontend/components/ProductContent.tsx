"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getImageUrl } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/lib/cart-store"
import { Minus, Plus, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface Product {
  id: number
  sku: string
  price: number
  priceOld: number | null
  discountPercent: number
  size: string | null
  images: string[]
}

interface Translation {
  name: string
  description: string | null
}

interface Props {
  product: Product
  translation: Translation
}

export default function ProductContent({ product, translation }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("75ml")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [packagingColor, setPackagingColor] = useState("червен")
  const [addCard, setAddCard] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [deliveryText, setDeliveryText] = useState("")

  const addItem = useCartStore((state) => state.addItem)

  const hasDiscount = product.discountPercent > 0

  // Проверяем время для отображения доступности доставки
  useEffect(() => {
    const checkDeliveryTime = () => {
      const now = new Date()
      // Получаем текущий час в болгарском часовом поясе (Europe/Sofia)
      const bulgarianTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sofia" }))
      const currentHour = bulgarianTime.getHours()

      if (currentHour < 15) {
        setDeliveryText("Наличен за доставка днес")
      } else {
        setDeliveryText("Наличен за доставка утре")
      }
    }

    checkDeliveryTime()
    // Обновляем каждую минуту на случай, если пользователь держит страницу открытой
    const interval = setInterval(checkDeliveryTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAddToCart = () => {
    addItem({
      sku: product.sku,
      name: translation.name,
      price: Number.parseFloat(product.price.toString()),
      quantity,
      image: product.images[0],
      options: {
        size: selectedSize,
        packagingColor,
        addCard,
      },
    })
    alert("Продуктът е добавен в количката!")
  }

  const variants = [
    { image: product.images[0], name: translation.name },
    { image: product.images[1] || product.images[0], name: "Вариант 2" },
    { image: product.images[2] || product.images[0], name: "Вариант 3" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-32 pb-16">
      {/* Left: Product Image Gallery */}
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Main Image */}
        <div className="relative w-full flex-1 bg-gray-100 mb-4 cursor-pointer" onClick={() => setShowLightbox(true)}>
          {product.images[selectedImage] ? (
            <Image
              src={getImageUrl(product.images[selectedImage]) || "/placeholder.svg"}
              alt={translation.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Няма снимка</div>
          )}
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 mb-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 bg-gray-100 flex-shrink-0 ${
                  selectedImage === index ? "ring-2 ring-black" : "opacity-60 hover:opacity-100"
                } transition`}
              >
                <Image
                  src={getImageUrl(image) || "/placeholder.svg"}
                  alt={`${translation.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        {product.images.length > 1 && (
          <div className="flex justify-center gap-2 text-sm text-gray-400">
            <span className="text-black">{String(selectedImage + 1).padStart(2, "0")}</span>
            <span>{String(product.images.length).padStart(2, "0")}</span>
          </div>
        )}

        {/* Lightbox */}
        {showLightbox && (
          <div
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/95 z-[9999] flex items-center justify-center"
            onClick={() => setShowLightbox(false)}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowLightbox(false)
              }}
              className="absolute top-4 right-4 z-[10000] p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              aria-label="Закрыть"
            >
              <X className="w-8 h-8 text-white" />
            </button>

            {/* Стрелка влево */}
            {product.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                }}
                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Контейнер изображения */}
            <div
              className="relative w-full h-full flex items-center justify-center px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={getImageUrl(product.images[selectedImage]) || "/placeholder.svg"}
                  alt={translation.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>

            {/* Стрелка вправо */}
            {product.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Индикатор текущего изображения */}
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {selectedImage + 1} / {product.images.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Product Details */}
      <div className="flex flex-col">
        {/* Category Tag */}
        <p className="text-xs tracking-widest uppercase mb-4 text-gray-600">БУКЕТИ</p>

        {/* Product Name */}
        <h1 className="text-4xl font-normal mb-4 font-serif">{translation.name}</h1>

        {/* Price */}
        <p className="text-2xl mb-6">{formatPrice(product.price)}</p>

        {/* Description */}
        {translation.description && (
          <p className="text-sm leading-relaxed mb-8 text-gray-700">{translation.description}</p>
        )}

        {/* Size Options */}
        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedSize("75ml")}
              className={`text-sm pb-1 transition ${
                selectedSize === "75ml" ? "border-b-2 border-black" : "text-gray-400"
              }`}
            >
              Малък
            </button>
            <button
              onClick={() => setSelectedSize("20ml")}
              className={`text-sm pb-1 transition ${
                selectedSize === "20ml" ? "border-b-2 border-black" : "text-gray-400"
              }`}
            >
              Голям
            </button>
          </div>
        </div>

        {/* Packaging Color */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Цвят на опаковката:</label>
          <select
            value={packagingColor}
            onChange={(e) => setPackagingColor(e.target.value)}
            className="w-full border rounded px-4 py-2"
          >
            <option value="червен">Червен</option>
            <option value="бял">Бял</option>
            <option value="естествен">Естествен (крафт)</option>
            <option value="прозрачен">Прозрачен</option>
          </select>
        </div>

        {/* Add Card */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={addCard}
              onChange={(e) => setAddCard(e.target.checked)}
              className="rounded"
            />
            <span>Добави картичка (+5 лв)</span>
          </label>
        </div>

        {/* Quantity */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2">Количество:</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-20 text-center border rounded px-3 py-2"
              min="1"
            />
            <button onClick={() => setQuantity(quantity + 1)} className="p-2 border rounded hover:bg-gray-100">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gray-100 hover:bg-gray-200 text-black py-4 mb-8 flex items-center justify-between px-6 transition text-sm tracking-wide"
        >
          <span>ДОБАВИ В КОЛИЧКА</span>
          <span>{formatPrice(product.price)}</span>
        </button>

        {/* Expandable Sections */}
        <div className="border-t border-gray-200">
          {/* Discover Details */}
          <button
            onClick={() => setExpandedSection(expandedSection === "discover" ? null : "discover")}
            className="w-full flex items-center justify-between py-4 border-b border-gray-200 text-sm tracking-wide hover:bg-gray-50 transition"
          >
            <span>ДЕТАЙЛИ ЗА ПРОДУКТА</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "discover" ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSection === "discover" && (
            <div className="py-4 px-2 text-sm text-gray-700 leading-relaxed border-b border-gray-200">
              <p>
                Всеки букет е ръчно изработен от нашите флористи с внимание към всеки детайл. Използваме само най-свежи
                цветя от проверени доставчици.
              </p>
            </div>
          )}

          {/* Product Details */}
          <button
            onClick={() => setExpandedSection(expandedSection === "details" ? null : "details")}
            className="w-full flex items-center justify-between py-4 border-b border-gray-200 text-sm tracking-wide hover:bg-gray-50 transition"
          >
            <span>ИНФОРМАЦИЯ ЗА ДОСТАВКА</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "details" ? "rotate-180" : ""}`}
            />
          </button>
          {expandedSection === "details" && (
            <div className="py-4 px-2 text-sm text-gray-700 leading-relaxed border-b border-gray-200">
              <p>
                Безплатна доставка за поръчки над 100 лв във Варна. Доставка в рамките на 2-4 часа след потвърждение на
                поръчката.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
