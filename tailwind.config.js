module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Dunkelblau
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Gold
          light: '#FBBF24',
          dark: '#D97706',
        },
        background: {
          DEFAULT: '#F3F4F6', // Hellgrau
          dark: '#1F2937',
        },
        text: {
          DEFAULT: '#1F2937', // Dunkelgrau
          light: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
