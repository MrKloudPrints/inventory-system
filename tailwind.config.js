/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Helvetica Neue'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'SF Mono'", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        widest: "0.2em",
        label: "0.15em",
      },
    },
  },
  plugins: [],
};
