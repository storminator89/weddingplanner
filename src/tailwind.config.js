module.exports = {
  // ...existing code...
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#7C3AED",    // Violet-600
          "secondary": "#EC4899",  // Pink-500
          "accent": "#06B6D4",     // Cyan-500
          "neutral": "#1F2937",    // Gray-800
          "base-100": "#FFFFFF",
          "base-200": "#F3F4F6",   // Gray-100
          "base-300": "#E5E7EB",   // Gray-200
          "info": "#0EA5E9",       // Sky-500
          "success": "#10B981",    // Emerald-500
          "warning": "#F59E0B",    // Amber-500
          "error": "#EF4444",      // Red-500
        },
        dark: {
          "primary": "#8B5CF6",    // Violet-500
          "secondary": "#F472B6",  // Pink-400
          "accent": "#22D3EE",     // Cyan-400
          "neutral": "#F3F4F6",    // Gray-100
          "base-100": "#1F2937",   // Gray-800
          "base-200": "#374151",   // Gray-700
          "base-300": "#4B5563",   // Gray-600
          "info": "#38BDF8",       // Sky-400
          "success": "#34D399",    // Emerald-400
          "warning": "#FBBF24",    // Amber-400
          "error": "#F87171",      // Red-400
        }
      }
    ]
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar')({ nocompatible: true })
  ],
  // Optional: you can add variants for the scrollbar
  variants: {
    scrollbar: ['rounded', 'dark']
  }
};
