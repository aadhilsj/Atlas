/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#faf8f4',
          100: '#f2ede3',
          200: '#e5ddd0',
          300: '#d4c8b5',
          400: '#b8a892',
          500: '#9e8e78',
          600: '#7d6f5e',
          700: '#5e5247',
          800: '#3d3630',
          900: '#1e1a17',
        },
        ink: '#0f0e0c',
        glow: '#e8b86d',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
