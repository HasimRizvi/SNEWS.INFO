import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          soft: "#1E293B",
        },
        accent: {
          DEFAULT: "#F97316",
          dark: "#C24A0A",
        },
        teal: {
          DEFAULT: "#14B8A6",
          dark: "#0F766E",
        },
        surface: "#F1F5F9",
        border: "#E2E8F0",
        ink: "#334155",
        muted: "#64748B",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
