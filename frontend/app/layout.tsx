import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

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
  title: "Izabels - Магазин за цветя и подаръци",
  description: "Свежи букети и подаръци с доставка в София",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className={`${playfair.variable} ${ibmPlexMono.variable}`}>
      <body className="font-mono bg-background text-foreground">{children}</body>
    </html>
  )
}
