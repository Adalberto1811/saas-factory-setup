import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Synergos Solutions',
  description: 'La Sinergia que Transforma tu Negocio - Impulsando tu negocio con Inteligencia Artificial',
  manifest: '/manifest.json',
  themeColor: '#020617',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synergos',
  },
  icons: {
    apple: '/icons/icon-192.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered: ', registration.scope);
                }, function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
