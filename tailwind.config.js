/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      /* ----------  PomoChamp Color Palette  ---------- */
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // Core palette
        lightYellow: '#FFE56A',  // Brightest yellow
        goldenYellow: '#FFC300', // Primary accent/success
        orangeYellow: '#FF9F00',  // Warm transition
        deepOrange: '#FF7300',    // Energy/warning
        redOrange: '#FF3A08',     // Urgent/action
        pureRed: '#FE1C06',       // Danger/error
        deepBlue: '#07399D',      // Primary UI blue
        nearBlack: '#0D0D0F',     // Backgrounds/bezel
        
        // Semantic aliases for easier use
        primary: '#FFC300',       // Golden yellow
        secondary: '#07399D',     // Deep blue
        accent: '#FFE56A',        // Light yellow
        danger: '#FE1C06',        // Pure red
        warning: '#FF7300',       // Deep orange
        success: '#2ecc40',       // Arcade green
        
        // Legacy aliases (keeping for compatibility)
        bezel: '#0D0D0F',
        neonRed: '#FE1C06',
        neonYel: '#FFC300',
        crtBlue: '#07399D',
      },
      boxShadow: {
        neon: '0 0 8px rgba(255,255,255,0.8)', // subtle glow
        goldenGlow: '0 0 20px rgba(255, 195, 0, 0.4)', // Golden yellow glow
        redGlow: '0 0 20px rgba(254, 28, 6, 0.4)', // Red glow
        blueGlow: '0 0 20px rgba(7, 57, 157, 0.4)', // Blue glow
      },
      /* ------------------------------------------ */
    },
  },

  plugins: [],
};