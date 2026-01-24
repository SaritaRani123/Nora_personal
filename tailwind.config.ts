import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5e9',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        info: {
          DEFAULT: '#299cdb',
          subtle: '#e7f5fb',
        },
        success: {
          DEFAULT: '#0ab39c',
          subtle: '#e6f7f5',
        },
        danger: {
          DEFAULT: '#f06548',
          subtle: '#fef0ed',
        },
        warning: {
          DEFAULT: '#f7b84b',
          800: '#92400e',
          subtle: '#fef8ed',
        },
        secondary: {
          DEFAULT: '#878a99',
          subtle: '#f4f4f6',
        },
      },
    },
  },
  plugins: [],
}
export default config
