import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Next 5 Minutes - Daily Parenting Connections',
  description: 'Get a daily 5-minute parenting connection prompt to strengthen your relationship with your child',
  metadataBase: new URL('https://5app-d22y33qyj-alex-napierskis-projects.vercel.app'),
  openGraph: {
    title: 'The Next 5 Minutes - Daily Parenting Connections',
    description: 'Simple, 5-minute ways to connect with your child. No prep required.',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Next 5 Minutes - Daily Parenting Connections',
    description: 'Simple, 5-minute ways to connect with your child. No prep required.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
