import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a855f7",
        secondary: "#ec4899",
        dark: {
          900: "#0f0e17",
          800: "#1a1625",
          700: "#251e3a",
        },
      },
      backgroundImage: {
        "gradient-dark":
          "linear-gradient(135deg, #0f0e17 0%, #1a1625 25%, #251e3a 50%, #1a1625 75%, #0f0e17 100%)",
        "gradient-purple":
          "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
      },
      boxShadow: {
        primary: "0 0 30px rgba(168, 85, 247, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
