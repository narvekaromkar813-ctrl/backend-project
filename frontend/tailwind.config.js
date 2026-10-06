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
        navy: {
          950: '#06101c',
          900: '#0D2137',
          850: '#102844',
          800: '#143356',
          700: '#1c4573',
          600: '#255e9c',
          500: '#337ecc',
        },
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        energy: {
          green: '#10B981',
          orange: '#F97316',
          blue: '#0EA5E9',
          purple: '#8B5CF6',
          yellow: '#FBBF24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'solar-glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'solar-glow-lg': '0 0 40px -10px rgba(249, 115, 22, 0.4)',
        'dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
