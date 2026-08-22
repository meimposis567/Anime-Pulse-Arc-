/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'anime-grid': "radial-gradient(var(--tw-anime-dot) 1px, transparent 1px)",
        'anime-radial': "radial-gradient(60% 60% at 50% 40%, var(--anime-glow-1) 0%, transparent 60%)",
        'anime-linear': "linear-gradient(135deg, var(--anime-grad-1), var(--anime-grad-2), var(--anime-grad-3))"
      },
      boxShadow: {
        'neon': '0 0 10px var(--anime-neon), 0 0 20px var(--anime-neon)',
        'glass': '0 10px 40px rgba(0,0,0,0.25)'
      },
      colors: {
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine 2.4s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .6 }
        }
      }
    },
  },
  plugins: [],
};
