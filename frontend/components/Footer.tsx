import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-accent text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Лого и описание - шире */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <Image src="/logo.svg" alt="Izabel's Flowers" width={80} height={80} className="mb-4" />
            </div>
            <p className="text-gray-300 leading-relaxed text-sm max-w-md">
              Izabel's Flowers — флорист във Варна, предлагащ луксозни букети от цветя и индивидуални аранжировки,
              флорални работилници и доставка в същия ден в цяла Варна.
            </p>
          </div>

          {/* Пустая колонка для отступа */}
          <div className="hidden md:block md:col-span-3"></div>

          {/* Информация - справа */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-6 tracking-wide text-base">Информация</h3>
            <nav className="space-y-3">
              <Link href="/about" className="block text-white hover:text-gray-200 transition text-base">
                Нашата история
              </Link>
              <Link href="/contact" className="block text-white hover:text-gray-200 transition text-base">
                Свържете се с нас
              </Link>
              <Link href="/weddings" className="block text-white hover:text-gray-200 transition text-base">
                Сватби
              </Link>
              <Link href="/blog" className="block text-white hover:text-gray-200 transition text-base">
                Блог
              </Link>
            </nav>
          </div>

          {/* Нашият магазин - после Информация */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-6 tracking-wide text-base">Нашият магазин</h3>
            {/* Карта крупнее */}
            <div className="relative w-full h-32 mb-4 rounded overflow-hidden bg-gray-700">
              <Image 
                src="/placeholder.jpg" 
                alt="Карта" 
                fill 
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-300">Google Maps</span>
              </div>
            </div>
            <div className="space-y-2 text-white text-base">
              <p>
                ул. Тодор Радев Пенев 13
                <br />
                Варна
              </p>
              <p>+359 888 110 801</p>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Левый нижний угол - пункты обслуживания клиентов */}
            <div className="flex flex-wrap gap-4 text-[8pt] text-gray-400">
              <Link href="/refund-policy" className="hover:text-white transition">
                Политика за възстановяване
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Условия за ползване
              </Link>
              <Link href="/privacy" className="hover:text-white transition">
                Политика за поверителност
              </Link>
            </div>

            {/* Правый нижний угол - соцсети */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
