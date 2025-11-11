/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#22d3ee',
        background: '#0f172a',
        surface: '#111827'
      }
    }
  },
  plugins: []
};
