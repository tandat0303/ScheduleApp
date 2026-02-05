/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#a855f7",
          700: "#7e22ce",
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
