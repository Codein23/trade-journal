/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        surface: "#171717",
        surface2: "#1f1f1f",
        border: "#2a2a2a",
        muted: "#a3a3a3",
        brand: {
          green: "#22c55e",
          red: "#ef4444",
          orange: "#f59e0b",
          blue: "#3b82f6",
          purple: "#a855f7",
        },
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
