import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde folha — ações positivas, saúde
        canopy: {
          50:  "#f0faf0",
          100: "#d9f2d9",
          200: "#b0e5b0",
          300: "#7ed07e",
          400: "#4db84d",
          500: "#2e9e2e",
          600: "#207f20",
          700: "#19641a",
          800: "#155116",
          900: "#0d3b0e",
          950: "#072108",
        },
        // Marrom madeira — neutros, superfícies
        bark: {
          50:  "#faf6f0",
          100: "#f0e8d9",
          200: "#e0cfb2",
          300: "#cdb082",
          400: "#b98e52",
          500: "#9e7235",
          600: "#7f5b27",
          700: "#64461f",
          800: "#4f3719",
          900: "#3b2912",
          950: "#21160a",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
