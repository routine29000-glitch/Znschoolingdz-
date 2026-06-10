import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base palette
        cream: "#FCFCFA",
        beige: "#F5F0E8",
        olive: "#4A7C59",
        "olive-dark": "#3A6347",
        "olive-light": "#6A9C79",
        ink: "#2C3E2F",
        "ink-light": "#4A5E4D",
        muted: "#8A9E8D",
        error: "#C77D7D",
        success: "#8FCB81",
        // Male theme
        "blue-calm": "#4A6FA5",
        "blue-light": "#EEF2F8",
        "blue-mid": "#D4E0F0",
        // Female theme
        "peach-warm": "#C97B5A",
        "pink-soft": "#F2D7CC",
        "pink-mid": "#E8B8A8",
        "purple-light": "#E8DCEF",
        // Neutral theme
        "neutral-bg": "#F5F0E8",
      },
      fontFamily: {
        arabic: ["'Noto Naskh Arabic'", "'Cairo'", "sans-serif"],
        display: ["'Cairo'", "sans-serif"],
        body: ["'Noto Naskh Arabic'", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
