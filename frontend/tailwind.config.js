/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary — indigo (precise scale) ─────────────────────
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          DEFAULT: '#4f46e5',
        },
        // ── Neutral — true gray (Tailwind gray) ──────────────────
        neutral: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
          DEFAULT: '#6b7280',
        },
        // ── Success — emerald ─────────────────────────────────────
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10b981',
        },
        // ── Warning — amber ───────────────────────────────────────
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          DEFAULT: '#f59e0b',
        },
        // ── Danger — rose ─────────────────────────────────────────
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          DEFAULT: '#e11d48',
        },
        // ── Sidebar specific ──────────────────────────────────────
        sidebar: {
          bg:      '#111827',
          hover:   'rgba(255,255,255,0.07)',
          active:  'rgba(255,255,255,0.12)',
          border:  'rgba(255,255,255,0.08)',
          text:    '#9ca3af',
          textActive: '#ffffff',
        },
      },

      fontFamily: {
        sans: [
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },

      fontSize: {
        '2xs': ['11px', { lineHeight: '16px' }],
      },

      boxShadow: {
        // Surgical, layered shadows — not the generic Tailwind ones
        xs:     '0 1px 2px rgba(0,0,0,0.05)',
        sm:     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:     '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        lg:     '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        xl:     '0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.06)',
        '2xl':  '0 25px 50px -12px rgba(0,0,0,0.18)',
        // Coloured glows for primary accents
        'glow-indigo': '0 0 0 3px rgba(99,102,241,0.15)',
        'glow-sm':     '0 4px 14px 0 rgba(79,70,229,0.18)',
        // Inner shadow for inset fields
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },

      borderRadius: {
        DEFAULT: '0.5rem',
        card:    '0.875rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
      },

      spacing: {
        // Sidebar widths exposed as spacing tokens
        sidebar: '220px',
        'sidebar-sm': '64px',
      },

      transitionDuration: {
        DEFAULT: '150ms',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
