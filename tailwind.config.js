/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc6fb',
          400: '#36a8f5',
          500: '#0c8de4',
          600: '#0070c2',
          700: '#02599d',
          800: '#064b82',
          900: '#0a3f6c',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
        },
        mauve: {
          50: '#f4f2f8',
          100: '#e9e6f0',
          200: '#cfc8de',
          300: '#a89db8',
          400: '#8a7da3',
          500: '#6f6399',
          600: '#5a5081',
          700: '#473f66',
          800: '#332e4d',
          900: '#221e36',
          DEFAULT: '#6f6399',
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #0c8de4 0%, #6f6399 55%, #d946ef 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, #e0effe 0%, #e9e6f0 55%, #fae8ff 100%)',
        'hero-gradient':
          'linear-gradient(135deg, #221e36 0%, #473f66 25%, #6f6399 55%, #0c8de4 100%)',
        'app-bg':
          'radial-gradient(at 80% -10%, rgba(217, 70, 239, 0.18) 0px, transparent 45%), ' +
          'radial-gradient(at 0% 0%, rgba(111, 99, 153, 0.18) 0px, transparent 45%), ' +
          'linear-gradient(180deg, #eef2f7 0%, #d9dfeb 100%)',
        'app-bg-dark':
          'radial-gradient(at 80% -10%, rgba(217, 70, 239, 0.22) 0px, transparent 45%), ' +
          'radial-gradient(at 0% 0%, rgba(12, 141, 228, 0.18) 0px, transparent 45%), ' +
          'linear-gradient(180deg, #0b0d1a 0%, #060812 100%)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px rgba(15, 23, 42, 0.10)',
        glow: '0 8px 28px -8px rgba(111, 99, 153, 0.65)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-3deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-1deg)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translateY(0px) rotate(4deg)' },
          '50%': { transform: 'translateY(-10px) rotate(6deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -25px) scale(1.1)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.25s ease-out',
        'gradient-shift': 'gradient-shift 12s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'float-2': 'float-2 7s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
