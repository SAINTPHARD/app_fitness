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
    extend: {
      colors: {
        canvas: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        muted: 'var(--bg-muted)',
        content: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        subtle: 'var(--text-muted)',
        line: 'var(--border)',
        brand: 'var(--brand)',
        'brand-ink': 'var(--brand-ink)',
        'brand-soft': 'var(--brand-soft)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
      },
      borderRadius: {
        '2xl': 'var(--radius-lg)',
        '3xl': 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow)',
        lg: 'var(--shadow)',
        xl: 'var(--shadow)',
        '2xl': 'var(--shadow)',
      },
      spacing: {
        control: '2.75rem',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
