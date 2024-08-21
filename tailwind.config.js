module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
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
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#1E3A8A",
          secondary: "#F59E0B",
          "base-100": "#F3F4F6",
          // Fügen Sie hier weitere Farben hinzu, wenn nötig
        },
      },
      {
        dark: {
          primary: "#3B82F6",
          secondary: "#FBBF24",
          "base-100": "#1F2937",
          // Fügen Sie hier weitere Farben hinzu, wenn nötig
        },
      },
    ],
  },
}