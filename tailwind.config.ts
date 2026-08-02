import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        ink: "#111111",
        accent: "#3B82F6",
        good: "#10B981",
        bad: "#E2574C",
        locked: "#EDEDED",
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
