import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GifVibes - Professional Video to GIF Converter | Free Online Tool',
  description: 'Convert videos to animated GIFs instantly with GifVibes. Free, private, browser-based video to GIF converter. No uploads, no registration, supports MP4, MOV, AVI, WebM. Transform your videos into beautiful animated GIFs online.',
  keywords: [
    'video to gif converter',
    'mp4 to gif',
    'video gif maker',
    'online gif converter',
    'free gif converter',
    'video animation tool',
    'gif maker online',
    'convert video to gif',
    'gifvibes',
    'video converter tool'
  ],
  authors: [{ name: 'GifVibes Team' }],
  creator: 'GifVibes',
  publisher: 'GifVibes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gifvibes.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GifVibes - Professional Video to GIF Converter',
    description: 'Convert videos to animated GIFs instantly with GifVibes. Free, private, browser-based converter. No uploads, no registration required.',
    url: 'https://gifvibes.com',
    siteName: 'GifVibes',
    images: [
      {
        url: '/logo2.png',
        width: 400,
        height: 400,
        alt: 'GifVibes Logo - Professional Video to GIF Converter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GifVibes - Professional Video to GIF Converter',
    description: 'Convert videos to animated GIFs instantly with GifVibes. Free, private, browser-based converter.',
    images: ['/logo2.png'],
    creator: '@gifvibes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console code
    yandex: 'your-yandex-verification-code', // Add if needed
    yahoo: 'your-yahoo-verification-code', // Add if needed
  },
  category: 'technology',
  classification: 'Web Application',
  other: {
    'application-name': 'GifVibes',
    'apple-mobile-web-app-title': 'GifVibes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#3B82F6',
    'theme-color': '#3B82F6',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
