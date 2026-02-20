import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Synergos Solutions',
  description: 'La Sinergia que Transforma tu Negocio - Impulsando tu negocio con Inteligencia Artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
