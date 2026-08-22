/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Zen Maru Gothic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: {
          900: '#04030c',
          800: '#080615',
          700: '#0d0a1f',
          600: '#141029',
          500: '#1c1636',
        },
        sakura: {
          400: '#ff9ec7',
          500: '#ff6fae',
          600: '#ff3d8f',
        },
        cyber: {
          400: '#5ff0ff',
          500: '#22d3ee',
          600: '#06b6d4',
        },
        arcane: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
        },
        ember: {
          400: '#fcd34d',
          500: '#fbbf24',
        },
      },
      boxShadow: {
        neon: '0 0 18px rgba(34,211,238,.35), 0 0 42px rgba(168,85,247,.22)',
        'neon-pink': '0 0 18px rgba(255,111,174,.4), 0 0 44px rgba(255,61,143,.22)',
        glass: '0 18px 50px -12px rgba(0,0,0,.7)',
        lift: '0 28px 60px -18px rgba(34,211,238,.35), 0 12px 28px -12px rgba(168,85,247,.4)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        arc: 'cubic-bezier(.22,1,.36,1)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        drift: 'drift 26s linear infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        'pulse-soft': 'pulse-soft 3.4s ease-in-out infinite',
        'border-spin': 'border-spin 6s linear infinite',
        marquee: 'marquee 32s linear infinite',
        // `backwards` (not `both`): the entrance holds its start state during the
        // stagger delay, then releases the element back to its own transform.
        // With `both` the final keyframe's translateY(0) would stick forever and
        // override the pointer-tracked tilt set via inline style.
        'fade-up': 'fade-up .6s cubic-bezier(.22,1,.36,1) backwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-80px,-60px,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.55' },
        },
        'border-spin': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
