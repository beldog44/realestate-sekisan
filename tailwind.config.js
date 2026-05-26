/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./sidepanel.html", "./popup.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        score: {
          excellent: "#16a34a",
          good: "#65a30d",
          fair: "#d97706",
          poor: "#dc2626",
        },
      },
      fontSize: {
        "2xs": "0.625rem",
      },
    },
  },
  plugins: [],
};
