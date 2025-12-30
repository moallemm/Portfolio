/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Dark mode primary
          light: '#faf8f3', // Light mode: warm ceramic white
        },
        secondary: {
          DEFAULT: '#1e293b', // Dark mode secondary
          light: '#f5f1e8', // Light mode: soft warm white
        },
        accent: {
          DEFAULT: '#3b82f6', // Blue
          light: '#2563eb', // Darker blue for light mode
        },
        'accent-dark': '#1e40af',
        // Text colors
        'text-primary': {
          DEFAULT: '#ffffff',
          light: '#1f2937', // Dark text for light mode
        },
        'text-secondary': {
          DEFAULT: '#cbd5e1',
          light: '#6b7280', // Medium gray for light mode
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
