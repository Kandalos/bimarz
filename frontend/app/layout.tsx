import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/Providers"

// Metadata must be exported from a Server Component
export const metadata: Metadata = {
  title: "کافه شالپلاته - نشر بی مرز",
  description: "ساخته شده با اولین کافه‌کتاب ایرانی در اروپا",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Persian font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
        {/* Icons */}
        <link rel="stylesheet" href="https://cdn.lineicons.com/4.0/lineicons.css" />
      </head>

      <body className="font-sans antialiased">
        {/* All global Providers (like AuthProvider) must wrap children here */}
        <Providers>
          {children}
        </Providers>

        <Analytics />
      </body>
    </html>
  )
}
