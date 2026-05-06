/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        sidebarBg: 'var(--sidebar-bg)',
        sidebarAccent: 'var(--sidebar-accent)',
        accentYellow: 'var(--accent-yellow)',
        accentRed: 'var(--accent-red)',
        accentBlue: 'var(--accent-blue)',
        accentGreen: 'var(--accent-green)',
        accentOrange: 'var(--accent-orange)',
        accentPurple: 'var(--accent-purple)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        cardBg: 'var(--card-bg)',
      },
      fontFamily: {
        heading: ['"Fredoka One"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        crayon: '2px 2px 0px rgba(139, 90, 43, 0.4)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        btn: 'var(--radius-btn)',
        input: 'var(--radius-input)',
        badge: 'var(--radius-badge)',
      }
    },
  },
  plugins: [],
}
