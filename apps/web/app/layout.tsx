import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: {
    default: "PodNex — AI Podcast Studio",
    template: "%s | PodNex",
  },
  description:
    "Turn notes, articles, or outlines into studio-quality, two-voice podcast episodes with AI — via the dashboard or the API.",
}

const fontSerif = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontSans = Inter({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSerif.variable} ${fontSans.variable} antialiased`}
        style={{
          fontFamily: "var(--font-sans)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
