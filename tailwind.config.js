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
    },
  },
  plugins: [],
}

