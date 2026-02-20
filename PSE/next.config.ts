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
}

export default nextConfig
