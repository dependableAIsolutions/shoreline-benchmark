import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: "#080c18",
          800: "#0e1b3d",
          700: "#13294f"
        },
        sand: "#c4b582",
        solid: "#3da84a",
        concrete: "#8a9caa"
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
        serif: ["Crimson Text", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
