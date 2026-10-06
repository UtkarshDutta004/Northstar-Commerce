/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172623',
        forest: '#244a3d',
        moss: '#76917b',
        citrus: '#e4ef77',
        paper: '#f8f8f5',
        clay: '#c96448',
        line: '#e2e5df',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      boxShadow: { soft: '0 18px 48px rgba(23, 38, 35, .08)' },
    },
  },
  plugins: [],
};
