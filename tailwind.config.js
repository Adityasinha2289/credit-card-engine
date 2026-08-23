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
        'ag-glow-primary': '0 4px 16px 0 rgba(42, 157, 92, 0.10), 0 8px 32px 0 rgba(42, 157, 92, 0.05)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      colors: {
        // V2 SEMANTIC SYSTEM
        semantic: {
          canvas: 'var(--color-canvas)',
          shell: 'var(--color-shell)',
          'surface-primary': 'var(--color-surface-primary)',
          'surface-card': 'var(--color-surface-card)',
          'surface-elevated': 'var(--color-surface-elevated)',
          'surface-intelligence': 'var(--color-surface-intelligence)',
          brand: 'var(--color-brand)',
          'brand-strong': 'var(--color-brand-strong)',
        },
        'semantic-text': {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        'semantic-border': {
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          intelligence: 'var(--color-border-intelligence)',
        },
        
        // V3 OBSIDIAN FOUNDATION (Legacy)
        obsidian: '#070A08',
        canvas: {
          50: '#030504',
          100: '#070A08', // Root background
          200: '#0A0A0A',
          300: '#111111',
        },
        surface: {
          shell: '#050806',
          primary: '#07120D', 
          card: '#07120D', 
          elevated: '#081A12', 
          intelligence: '#0A2418',
          'intelligence-elevated': '#0A2418',
          secondary: '#07120D',
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
          900: '#2A9D5C', // Primary brand action/value
          emerald: '#2A9D5C',
        },
        // Action / Status
        profit: '#2A9D5C',
        loss: '#FF453A',
        caution: '#FF9F0A',
        
        // V3 TYPOGRAPHY COLORS
        text: {
          primary: '#F2F4F2',
          secondary: '#A0AAA5',
          tertiary: '#737C77',
          muted: '#59615D',
          disabled: 'rgba(242, 244, 242, 0.20)',
        },
        border: {
          subtle: '#242D29',
          strong: '#242D29',
          intelligence: '#164534',
          hover: '#1E6549',
          emerald: 'rgba(42, 157, 92, 0.3)',
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
