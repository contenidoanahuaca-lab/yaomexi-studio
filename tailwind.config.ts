import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yaoGreen: '#2E7D32',
        yaoGold: '#C7A73D',
        yaoDark: '#0F0F0F'
      },
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'],
        body: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto']
      }
    }
  },
  plugins: []
} satisfies Config
