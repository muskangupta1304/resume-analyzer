/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        darkCard: 'rgba(17, 25, 40, 0.75)',
        brandBlue: '#3b82f6',
        brandPurple: '#8b5cf6',
        brandCyan: '#06b6d4',
        accentGold: '#f59e0b',
        borderGlass: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neonBlue: '0 0 15px rgba(59, 130, 246, 0.5)',
        neonPurple: '0 0 15px rgba(139, 92, 246, 0.5)',
      },
      backdropBlur: {
        glass: '16px',
      }
    },
  },
  plugins: [],
}
