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
        'cadre-bg': '#F2F2F2',
        'cadre-text': '#1A1A1A',
        'cadre-secondary': '#666666',
        'cadre-border': '#E0E0E0',
        'cadre-hover': '#EAEAEA',
        'cadre-red': '#EA4335',
        'cadre-blue': '#4285F4',
        'cadre-yellow': '#FBBC04',
        'cadre-green': '#34A853',
      },
    },
  },
  plugins: [],
}
