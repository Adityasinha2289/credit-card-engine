/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        'ag-base': '0 1px 2px 0 rgba(0,0,0, 0.4), 0 2px 8px 0 rgba(0,0,0, 0.6)',
        'ag-card': '0 2px 4px 0 rgba(0,0,0, 0.4), 0 4px 16px 0 rgba(0,0,0, 0.6)',
        'ag-hover': '0 4px 8px 0 rgba(0,0,0, 0.4), 0 8px 24px 0 rgba(0,0,0, 0.8)',
        'ag-float': '0 8px 16px 0 rgba(0,0,0, 0.6), 0 16px 40px 0 rgba(0,0,0, 1.0)',
        'ag-modal': '0 12px 24px 0 rgba(0,0,0, 0.8), 0 24px 64px 0 rgba(0,0,0, 1.0)',
        'ag-glow-primary': '0 4px 16px 0 rgba(0, 229, 153, 0.10), 0 8px 32px 0 rgba(0, 229, 153, 0.05)',
      },
      colors: {
        // V3 OBSIDIAN FOUNDATION
        obsidian: '#050505',
        canvas: {
          50: '#030303',
          100: '#050505', // Root background
          200: '#0A0A0A',
          300: '#111111',
        },
        surface: {
          primary: '#0A0A0A', // Base panels
          elevated: '#111111', // Floating elements, dropdowns, hovered items
          card: '#141414', // Explicit boundaries
          secondary: '#1A1A1A', // Hover on elevated
        },
        // V3 SEMANTIC EMERALD (Only for savings/value)
        brand: {
          50: '#011A11',
          100: '#023322',
          200: '#044D33',
          300: '#056644',
          400: '#078055',
          500: '#089966',
          600: '#0AB377',
          700: '#0BCC88',
          800: '#0DE699',
          900: '#00E599', // Primary brand action/value
          emerald: '#00E599',
        },
        // Action / Status
        profit: '#00E599',
        loss: '#FF453A',
        caution: '#FF9F0A',
        
        // V3 TYPOGRAPHY COLORS
        text: {
          primary: '#F6F6F6',
          secondary: 'rgba(255, 255, 255, 0.68)',
          muted: 'rgba(255, 255, 255, 0.42)',
          disabled: 'rgba(255, 255, 255, 0.20)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.05)',
          strong: 'rgba(255, 255, 255, 0.10)',
          emerald: 'rgba(0, 229, 153, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em'}],
        'xl': ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.625rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '3.25rem', letterSpacing: '-0.03em' }],
      },
      transitionTimingFunction: {
        'ag-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ag-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ag-sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '40px',
      },
    },
  },
  plugins: [],
};
