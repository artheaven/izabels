import Link from "next/link"
import { Facebook, Instagram, Phone, Mail } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-accent text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Google Maps - занимает 8 колонок */}
          <div className="md:col-span-8 relative h-64 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.8!2d27.9147!3d43.2141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4538baee19d67%3A0x6a1fb55b8b9b8b1a!2z0YPQuy4g0KLQvtC00L7RgCDQoNCw0LTQtdCyINCf0LXQvdC10LIgMTMsINCS0LDRgNC90LA!5e0!3m2!1sbg!2sbg!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Izabel's Flowers Location"
            />
            {/* Оверлей с логотипом и текстом поверх карты */}
            <div className="absolute bottom-0 left-0 p-4 bg-black/60 backdrop-blur-sm rounded-tr-lg max-w-sm">
              <div className="mb-3">
                <Image src="/isabels-flower-logo.svg" alt="Izabel's Flowers" width={80} height={40} className="brightness-0 invert" />
              </div>
              <p className="text-gray-200 leading-relaxed text-sm">
                Izabel's Flowers — флорист във Варна, предлагащ луксозни букети от цветя и индивидуални аранжировки,
                флорални работилници и доставка в същия ден в цяла Варна.
              </p>
            </div>
          </div>

          {/* Информация - 2 колонки */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-6 tracking-wide text-base">Информация</h3>
            <nav className="space-y-3">
              <Link href="/za-nas" className="block text-white hover:text-gray-200 transition text-base">
                Нашата история
              </Link>
              <Link href="/kontakti" className="block text-white hover:text-gray-200 transition text-base">
                Свържете се с нас
              </Link>
              <Link href="/svatbi" className="block text-white hover:text-gray-200 transition text-base">
                Сватби
              </Link>
              <Link href="/blog" className="block text-white hover:text-gray-200 transition text-base">
                Блог
              </Link>
            </nav>
          </div>

          {/* Контакти - 2 колонки */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-6 tracking-wide text-base">Контакти</h3>
            <div className="space-y-4 text-white">
              <a
                href="tel:+359888110801"
                className="flex items-center gap-2 hover:text-gray-200 transition text-base"
              >
                <Phone className="w-4 h-4" />
                +359 888 110 801
              </a>
              <a
                href="mailto:info@izabels.bg"
                className="flex items-center gap-2 hover:text-gray-200 transition text-base"
              >
                <Mail className="w-4 h-4" />
                info@izabels.bg
              </a>
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
