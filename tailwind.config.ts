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
        // === PULSE Kinetic Dual-Core Design System ===
        // Operations (Dark Mode)
        "ops-bg": "#0b0e14",
        "ops-surface": "#10131a",
        "ops-surface-low": "#191c22",
        "ops-surface-mid": "#1d2026",
        "ops-surface-high": "#272a31",
        "ops-surface-highest": "#32353c",
        "teal": "#00f2ff",
        "teal-dim": "#00dbe7",
        "teal-pale": "#74f5ff",
        "amber": "#ffb86c",
        "coral": "#ff8a80",
        "violet": "#7701d0",
        "violet-light": "#dcb8ff",

        // Shared semantic tokens (from Stitch)
        "primary-fixed-dim": "#00dbe7",
        "tertiary-fixed-dim": "#ffb86c",
        "surface-container-lowest": "#0b0e14",
        "surface-container-low": "#191c22",
        "surface-container": "#1d2026",
        "surface-container-high": "#272a31",
        "surface-container-highest": "#32353c",
        "on-surface": "#e1e2eb",
        "on-surface-variant": "#b9cacb",
        "outline": "#849495",
        "outline-variant": "#3a494b",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "on-primary": "#00363a",
        "on-primary-fixed": "#002022",
        "on-primary-fixed-variant": "#004f54",
        "secondary-container": "#7701d0",
        "on-secondary-container": "#dcb7ff",
        "surface-tint": "#00dbe7",

        // Fan App (Light Mode) — via CSS variables
        "fan-bg": "#f7f9ff",
        "fan-surface": "#ffffff",
        "fan-primary": "#7701d0",
        "fan-secondary": "#34628b",
        "fan-on-surface": "#0c1d2a",
        "fan-on-surface-variant": "#3e4851",
        "fan-outline": "#6e7882",
        "fan-outline-variant": "#bdc8d2",
        "fan-surface-container": "#e1efff",
        "fan-surface-container-high": "#d9eafc",
        "fan-surface-container-highest": "#d4e4f6",
        "fan-surface-container-low": "#ecf4ff",
      },
      borderRadius: {
        "ops": "4px",
        DEFAULT: "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px",
      },
      spacing: {
        "ops-padding": "0.5rem",
        "fan-padding": "1.25rem",
        "gutter": "1rem",
        "container-max": "1440px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "400" }],
        "data-display": ["24px", { lineHeight: "24px", letterSpacing: "-0.04em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
      animation: {
        "scan": "scan 8s linear infinite",
        "pulse-teal": "pulse-teal 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "route-dash": "dash 20s linear infinite",
        "glow": "glow 2s ease-in-out infinite",
        "blink": "blink 0.8s infinite",
        "ping-slow": "ping 2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        scan: {
          "0%": { top: "0" },
          "100%": { top: "100%" },
        },
        "pulse-teal": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".5", transform: "scale(1.2)" },
        },
        dash: {
          to: { strokeDashoffset: "-200" },
        },
        glow: {
          "0%, 100%": { opacity: "0.8", boxShadow: "0 0 10px rgba(0,219,231,0.2)" },
          "50%": { opacity: "1", boxShadow: "0 0 20px rgba(0,219,231,0.4)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
