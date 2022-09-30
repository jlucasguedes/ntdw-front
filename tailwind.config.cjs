/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './src/**/*.tsx',
    './index.html'
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 8 row grid
        'dashboard': '230px, auto',
      },
      gridTemplateRows: {
        // Simple 8 row grid
        'dashboard': '10vh 100%',
      },
      screens: {
        'tablet': { 'max': '960px' },
        // => @media (max-width: 960px) { ... }
      }
    },

  },
  plugins: [],
}
