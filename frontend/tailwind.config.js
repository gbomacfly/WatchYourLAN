/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // Bootstrap/Bootswatch is still loaded dynamically for legacy pages (until they're
  // migrated in later phases) and its stylesheet is inserted into the DOM *after*
  // Tailwind's, so at equal CSS specificity it would otherwise win cascade ties
  // (e.g. Bootstrap's plain `a { color: ...; text-decoration: underline; }` beating
  // Tailwind's `.text-slate-600`). Force Tailwind utilities to always win while both
  // systems coexist; safe to drop once Bootstrap is fully removed (Phase 5).
  important: true,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b8d0ff',
          300: '#8ab0ff',
          400: '#5c8bff',
          500: '#3b6bf5',
          600: '#2a4fd6',
          700: '#233fac',
          800: '#213689',
          900: '#1f306c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
