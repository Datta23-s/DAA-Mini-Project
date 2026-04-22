/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a1d23',
        'brand-card': '#252a33',
        'brand-accent': '#00d2ff',
        'brand-green': '#00ff88',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #2d343e 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-size': "20px 20px",
      }
    },
  },
  plugins: [],
}
