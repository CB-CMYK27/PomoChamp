/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      /* -------------  Arcade Theme  ------------- */
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        bezel:   '#0d0d0f',  // dark cabinet background
        neonRed: '#ff2e2e',
        neonYel: '#ffe14b',
        crtBlue: '#112773',
      },
      boxShadow: {
        neon: '0 0 8px rgba(255,255,255,0.8)', // glow on hover
      },
      /* ------------------------------------------ */
    },
  },

  plugins: [],
};
