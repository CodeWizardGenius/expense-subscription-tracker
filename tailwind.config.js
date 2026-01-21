// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add Nativewind preset and the paths to your files
  presets: [require('nativewind/preset')],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}