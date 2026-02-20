import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Performance Swimming Evolution',
  description: 'Tu Coach de Natación Personalizado - Porque tú eres único, tu plan también debe serlo',
  manifest: '/performance/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PSE Coach',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/performance/sw.js');
            });
          }
        `}} />
      </body>
    </html>
  )
}
