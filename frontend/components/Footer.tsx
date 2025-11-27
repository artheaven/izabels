import Link from "next/link"
import { Facebook, Instagram, Youtube } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-accent text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="mb-6">
              <Image src="/logo.svg" alt="Izabel's Flowers" width={80} height={80} className="mb-4" />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm">
              Izabel's Flowers — флорист във Варна, предлагащ луксозни букети от цветя и индивидуални аранжировки,
              флорални работилници и доставка в същия ден в цяла Варна.
            </p>
            <p className="text-gray-300 leading-relaxed mb-2 text-sm">Посетете ни на ул. Тодор Радев Пенев 13, Варна</p>
            <Link
              href="https://maps.google.com/?q=ул.+Тодор+Радев+Пенев+13,+Варна"
              target="_blank"
              className="text-gray-300 underline hover:text-white transition text-sm"
            >
              Вземете указания
            </Link>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">Нашият магазин</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                ул. Тодор Радев Пенев 13
                <br />
                Варна
              </p>
              <p>+359 888 110 801</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">Информация</h3>
            <nav className="space-y-3">
              <Link href="/about" className="block text-gray-300 hover:text-white transition text-sm">
                Нашата история
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition text-sm">
                Свържете се с нас
              </Link>
              <Link href="/delivery" className="block text-gray-300 hover:text-white transition text-sm">
                Ръководство за доставка
              </Link>
              <Link href="/workshops" className="block text-gray-300 hover:text-white transition text-sm">
                Подписани работилници
              </Link>
              <Link href="/weddings" className="block text-gray-300 hover:text-white transition text-sm">
                Сватби
              </Link>
              <Link href="/blog" className="block text-gray-300 hover:text-white transition text-sm">
                Блог
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">Обслужване на клиенти</h3>
            <nav className="space-y-3 mb-8">
              <Link href="/refund-policy" className="block text-gray-300 hover:text-white transition text-sm">
                Политика за възстановяване
              </Link>
              <Link href="/terms" className="block text-gray-300 hover:text-white transition text-sm">
                Условия за ползване
              </Link>
              <Link href="/privacy" className="block text-gray-300 hover:text-white transition text-sm">
                Политика за поверителност
              </Link>
            </nav>

            <h3 className="text-white font-semibold mb-6 tracking-wide text-sm">Последвайте ни</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
