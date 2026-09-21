import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#211815",
        blush: "#F5ECE6",
        wine: "#6E2439",
        rose: "#D9A9AE",
        goldline: "#A9855B",
        brand: {
          dark: "#050505",
          rose: "#be185d",
          pink: "#fce7f3",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        serif: ["var(--font-display)", "serif"],
        latin: ["var(--font-latin)", "serif"],
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "100%": { transform: "translate(20px, -30px) scale(1.1)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heroLogoIn: {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        blob: "blob 10s infinite alternate",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "hero-logo-in": "heroLogoIn 3s cubic-bezier(0.22,1,0.36,1) 0.3s forwards",
      },
    },
  },
  plugins: [],
};
export default config;
