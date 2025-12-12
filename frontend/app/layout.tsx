import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { baseMetadata } from "@/lib/metadata/templates"

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  ...baseMetadata,
  title: {
    default: "Izabels Flower Shop — Доставка на цветя във Варна",
    template: "%s | Izabels Flower Shop",
  },
  description: "Професионален магазин за цветя във Варна. Доставка на свежи букети, цветя в саксия и подаръци в цяла България. Експресна доставка за 2-4 часа.",
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
}

import { WebVitals } from './web-vitals'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className={`${playfair.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* Preconnect для критичных доменов */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-mono bg-background text-foreground">
        <WebVitals />
        {children}
      </body>
    </html>
  )
}
