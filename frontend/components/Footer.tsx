import Link from "next/link"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-accent text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Google Maps - слева */}
          <div className="md:col-span-5 relative">
            {/* Карта Google Maps */}
            <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.8!2d27.9147!3d43.2141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDEyJzUwLjgiTiAyN8KwNTQnNTMuMCJF!5e0!3m2!1sen!2sbg!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Izabel's Flowers Location"
              />
            </div>
            
            {/* Лого и текст на полупрозрачном фоне */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
              <div className="mb-3">
                <Image src="/logo.svg" alt="Izabel's Flowers" width={60} height={60} />
              </div>
              <p className="text-gray-200 leading-relaxed text-sm">
                Izabel's Flowers — флорист във Варна, предлагащ луксозни букети от цветя и индивидуални аранжировки,
                флорални работилници и доставка в същия ден в цяла Варна.
              </p>
            </div>
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

          {/* Контакти */}
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
