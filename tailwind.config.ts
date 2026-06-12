import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e17",
        panel: "#111827",
        accent: "#22d3ee",
        accent2: "#a78bfa",
      },
    },
  },
  plugins: [],
};

export default config;
