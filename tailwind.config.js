/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ace: {
          green: '#16A34A',
          'green-dark': '#0F4739',
          'green-deep': '#0D3A2F',
          'green-light': '#E8F5E9',
          'green-tint': '#DCFCE7',
          sky: '#0284C7',
          'sky-light': '#E0F2FE',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
