/**
 * Design system constants - Typeform-inspired
 * Centralized values for consistent UI across all pages
 */

export const colors = {
  // Primary palette (Typeform uses dark for accents)
  primary: {
    DEFAULT: '#0F172A', // neutral-900
    hover: '#1E293B',   // neutral-800
    light: '#F8FAFC',   // neutral-50
  },
  
  // Status colors
  success: {
    bg: '#DCFCE7',   // green-100
    text: '#166534',  // green-700
  },
  draft: {
    bg: '#F3F4F6',   // neutral-100
    text: '#6B7280',  // neutral-600
  },
  
  // Feedback colors
  error: {
    bg: '#FEE2E2',   // red-50
    border: '#EF4444', // red-500
    text: '#991B1B',  // red-900
  },
} as const;

export const typography = {
  // Type scale (based on Typeform's generous sizing)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px - Typeform's question title size
    '5xl': '3rem',    // 48px
  },
  
  // Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  // Consistent spacing scale (4px base)
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px - base
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
} as const;

export const borders = {
  radius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },
  
  width: {
    DEFAULT: '1px',
    2: '2px',
    4: '4px',
  },
} as const;

export const animations = {
  // Typeform uses smooth, intentional animations
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
  
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Common component styles (can be used with className)
export const components = {
  button: {
    primary: 'px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2',
    secondary: 'px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2',
    ghost: 'px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-all duration-300',
  },
  
  card: 'bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-all duration-300',
  
  input: 'w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all duration-300',
  
  modal: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
} as const;
