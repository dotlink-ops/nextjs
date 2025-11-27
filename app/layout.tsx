import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const envName = process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV
const isProd = envName === 'production'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Avidelta',
  description: 'Avidelta — advisory & ops systems.',
  robots: { index: isProd, follow: isProd },
  // optional canonical base for OG/Twitter URLs when public:
  metadataBase: siteUrl && isProd ? new URL(siteUrl) : undefined,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
