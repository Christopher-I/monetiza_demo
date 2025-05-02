/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {

    extend: {
      fontFamily: {
        futura: ["Futura Bk BT", ...defaultTheme.fontFamily.sans],
        montserrat: ['Montserrat', 'sans-serif'],
        afacad: ['Afacad', 'sans-serif'],
      },
      screens: {
        xs: '460px',
      },
    },
  },
  plugins: [],
}