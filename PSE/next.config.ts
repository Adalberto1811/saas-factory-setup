import type { NextConfig } from 'next'

// Sanitize environment variables that may have CRLF from Windows/Vercel
if (process.env.AUTH_URL) {
  process.env.AUTH_URL = process.env.AUTH_URL.trim()
}
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.trim()
}

const nextConfig: NextConfig = {
  // Configuración de Ruta Base para PWA y Producción
  basePath: '/performance',

  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },

  // Puente de enrutamiento 307: Auth.js genera URLs sin basePath por diseño.
  // Next.js las atrapa y las redirige limpiamente para que el Request URL coincida.
  async redirects() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/performance/api/auth/:path*',
        permanent: false,
        basePath: false,
      }
    ]
  },
}

export default nextConfig
