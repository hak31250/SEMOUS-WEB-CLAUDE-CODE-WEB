/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        semous: {
          black: '#0a0a0a',
          green: '#1a2e1a',
          'green-dark': '#0f1f0f',
          'green-light': '#2d4a2d',
          white: '#ffffff',
          gray: '#f5f5f5',
          'gray-mid': '#e0e0e0',
          'gray-text': '#6b6b6b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
