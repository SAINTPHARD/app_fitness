/** @type {import('tailwindcss').Config} */
export default {
  // Ativado via classe/atributo (`useTema` aplica `data-theme="dark"` no <html>)
  // em vez do padrão `media`, para o usuário poder alternar manualmente.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}