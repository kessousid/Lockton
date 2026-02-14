/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lockton: {
          navy: '#1B365D',
          'navy-light': '#2A4A7F',
          'navy-dark': '#0F2340',
          gold: '#C8A951',
          'gold-light': '#E0C878',
        },
      },
    },
  },
  plugins: [],
}
