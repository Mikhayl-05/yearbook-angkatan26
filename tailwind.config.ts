import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#C9A227',
          light: '#F0C040',
          dark: '#8B6914',
        },
        charcoal: {
          50:  '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09',
          DEFAULT: '#1E1E1E',
        },
        cream: '#F5F0E8',
        parchment: '#EDE0C4',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        heading: ['Cinzel', 'serif'],
        body: ['Lato', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A227 0%, #F0C040 40%, #C9A227 60%, #8B6914 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)',
        'paper-texture': "url('/textures/paper.png')",
      },
      animation: {
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'typewriter': 'typewriter 3s steps(40) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,162,39,0.4)' },
          '50%': { boxShadow: '0 0 60px rgba(201,162,39,0.9), 0 0 100px rgba(201,162,39,0.3)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(60px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      boxShadow: {
        'gold': '0 0 30px rgba(201,162,39,0.5), 0 4px 20px rgba(0,0,0,0.5)',
        'gold-sm': '0 0 10px rgba(201,162,39,0.3)',
        'card': '0 20px 60px rgba(0,0,0,0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(201,162,39,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
