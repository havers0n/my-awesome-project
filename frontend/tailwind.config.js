/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom fonts from index.css
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      // Custom breakpoints
      screens: {
        '2xsm': '375px',
        'xsm': '425px',
        '3xl': '2000px',
      },
      // Custom font sizes
      fontSize: {
        'title-2xl': ['72px', '90px'],
        'title-xl': ['60px', '72px'],
        'title-lg': ['48px', '60px'],
        'title-md': ['36px', '44px'],
        'title-sm': ['30px', '38px'],
        'theme-xl': ['20px', '30px'],
        'theme-sm': ['14px', '20px'],
        'theme-xs': ['12px', '18px'],
      },
      // Custom colors from index.css
      colors: {
        brand: {
          25: '#f2f7ff',
          50: '#ecf3ff',
          100: '#dde9ff',
          200: '#c2d6ff',
          300: '#9cb9ff',
          400: '#7592ff',
          500: '#465fff',
          600: '#3641f5',
          700: '#2a31d8',
          800: '#252dae',
          900: '#262e89',
          950: '#161950',
        },
        'blue-light': {
          25: '#f5fbff',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5ec',
          600: '#0086c9',
          700: '#026aa2',
          800: '#065986',
          900: '#0b4a6f',
          950: '#062c41',
        },
      },
      // Custom shadows
      boxShadow: {
        'theme-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'theme-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'theme-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
        'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'theme-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
        'focus-ring': '0px 0px 0px 4px rgba(70, 95, 255, 0.12)',
      },
      // Custom z-index
      zIndex: {
        '1': '1',
        '9': '9',
        '99': '99',
        '999': '999',
        '9999': '9999',
        '99999': '99999',
        '999999': '999999',
      },
    },
  },
  plugins: [],
  // Safelist critical classes that might be dynamically generated
  safelist: [
    // Chart and progress bar colors
    'bg-green-100',
    'text-green-800',
    'bg-yellow-100', 
    'text-yellow-800',
    'bg-red-100',
    'text-red-800',
    // Progress bar classes
    'bg-indigo-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-yellow-600',
    'bg-red-600',
    // Dynamic width classes for progress bars
    { pattern: /^w-(1|2|3|4|5|6|7|8|9|10|11|12)\/12$/ },
    { pattern: /^w-(1|2|3|4|5)\/6$/ },
    { pattern: /^w-(1|2|3|4)\/5$/ },
    { pattern: /^w-(1|2|3)\/4$/ },
    { pattern: /^w-(1|2)\/3$/ },
    { pattern: /^w-1\/2$/ },
    { pattern: /^w-full$/ },
    // Grid classes for dashboard
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6',
    'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12',
    'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6',
    // Animation classes
    'animate-spin',
    'animate-pulse',
    // Toast position classes
    'fixed',
    'top-4',
    'right-4',
    'z-50',
  ],
  // Optimize build performance
  corePlugins: {
    // Disable unused core plugins to reduce bundle size
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    // Keep essential ones
    preflight: true,
    container: true,
  },
  // JIT mode optimizations
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
