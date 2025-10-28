/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {

      extend: {
        screens: {
          'smrXl': '1300px',      
        },


        colors: {
          'nav-dark-bg': '',
        }
      },
    },
    plugins: [],
  }