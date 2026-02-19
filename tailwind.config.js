/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        /* Legacy tokens — remapped to dark theme */
        'cadre-bg':        '#111111',
        'cadre-text':      '#FFFFFF',
        'cadre-secondary': '#999999',
        'cadre-border':    '#2A2A2A',
        'cadre-hover':     '#2A2A2A',
        'cadre-muted':     '#555555',

        /* Brand */
        'brand-green':     '#00E87A',
        'brand-green-dim': 'rgba(0, 232, 122, 0.12)',

        /* Surfaces */
        'bg-base':     '#111111',
        'bg-surface':  '#1A1A1A',
        'bg-elevated': '#222222',
        'bg-hover':    '#2A2A2A',

        /* Borders */
        'border-default': '#2A2A2A',
        'border-subtle':  '#1F1F1F',
        'border-brand':   '#00E87A',

        /* Status */
        'status-new':     '#00E87A',
        'status-warning': '#F59E0B',
        'status-error':   '#EF4444',
      },
    },
  },
  plugins: [],
}
