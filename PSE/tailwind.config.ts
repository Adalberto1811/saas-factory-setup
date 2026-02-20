import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        synergos: {
          emerald: '#059669',
          gold: '#D4AF37',
          turquoise: '#14B8A6',
          red: '#DC2626',
          yellow: '#FBBF24',
          'electric-blue': '#00E5FF',
          'neon-green': '#39FF14',
          'chrome': '#F8F9FA',
        }
      },
      backgroundImage: {
        'liquid-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

export default config
