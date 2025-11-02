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
        'fire-red': '#E50914',
        'charcoal': '#0E0E0E',
        'light-gray': '#F2F2F2',
      },
      fontFamily: {
        'tajawal': ['Tajawal', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'slideInRight': 'slideInRight 0.4s ease-out',
        'slideInLeft': 'slideInLeft 0.4s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

