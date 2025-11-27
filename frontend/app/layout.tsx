import type React from "react"
import type { Metadata } from "next"
import { Montserrat_Alternates } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat_Alternates({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
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
    <html lang="bg" className={montserrat.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
