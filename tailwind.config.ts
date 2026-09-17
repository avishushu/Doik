import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#B8946A", light: "#D9C2A0", dark: "#8C6B47" },
        cream: "#FBF7F2",
        charcoal: "#2B2622",
      },
      fontFamily: { heebo: ["var(--font-heebo)"] },
    },
  },
  plugins: [],
};
export default config;
