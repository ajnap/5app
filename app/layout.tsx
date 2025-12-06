import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import './globals.css'

// Body font - clean, readable sans-serif
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

// Display font - warm, trustworthy serif
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
})

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
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className={dmSans.className}>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              fontFamily: 'var(--font-dm-sans)',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
