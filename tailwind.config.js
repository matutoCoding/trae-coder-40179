/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-blue': {
          50: '#E6EBF5',
          100: '#C2CFE8',
          200: '#8DA8D3',
          300: '#5880BE',
          400: '#2E5AA9',
          500: '#1B3F80',
          600: '#163366',
          700: '#10274D',
          800: '#0B1D3A',
          900: '#071426',
          950: '#040B17',
        },
        'alert-orange': {
          50: '#FFF2EC',
          100: '#FFD9C5',
          200: '#FFB08A',
          300: '#FF8A50',
          400: '#FF6B35',
          500: '#E04F1A',
          600: '#B03A10',
        },
        'success-emerald': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        'tech-purple': {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        'tech-indigo': {
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'count-up': 'countUp 1.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5), 0 0 20px rgba(255, 107, 53, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 107, 53, 0.8), 0 0 40px rgba(255, 107, 53, 0.4)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)",
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
      },
      backgroundSize: {
        'grid': '40px 40px',
        'shimmer': '200% 100%',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      },
    },
  },
  plugins: [],
};
