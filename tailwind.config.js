/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
        }
      },
      backgroundImage: {
        'meetflow-gradient': 'radial-gradient(ellipse at 60% 40%, #e9d5ff 0%, #fce7f3 40%, #fdf2f8 100%)',
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(139, 92, 246, 0.08)',
        'sidebar': '2px 0 16px 0 rgba(139, 92, 246, 0.06)',
      }
    },
  },
  plugins: [],
}
