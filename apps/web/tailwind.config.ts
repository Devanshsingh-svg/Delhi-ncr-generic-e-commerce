import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Dilli Nights — Delhi NCR identity palette (kept additive; emerald
        // `primary` stays available for components that still use it).
        delhi: {
          night: '#0F1115', // page background (dark)
          surface: '#16191F', // card surface (dark)
          elevated: '#202329', // raised surface / art well (dark)
          paper: '#FAF7F2', // warm off-white for text on dark
          brick: '#C84B31', // Red Fort terracotta — primary actions
          brickHover: '#B83A24',
          marigold: '#F59E0B', // savings + highlights (genda phool)
          green: '#059669', // verified/delivery accents
          muted: '#92949B',
          indigo: '#2F4470', // blue-pottery accent
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Mukta', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Baloo 2', 'Mukta', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
