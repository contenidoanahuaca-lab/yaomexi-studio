import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          jade: '#0F766E',
          turquoise: '#14B8A6',
          gold: '#F59E0B',
          red: '#EF4444',
          night: '#0B1020',
        },
        neutral: {
          50: colors.slate[50],
          100: colors.slate[100],
          200: colors.slate[200],
          300: colors.slate[300],
          400: colors.slate[400],
          500: colors.zinc[500],
          600: colors.zinc[600],
          700: colors.zinc[700],
          800: colors.zinc[800],
          900: colors.zinc[900],
          950: colors.zinc[950],
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', '"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config
