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
                critica: { DEFAULT: "#DC2626", light: "#FEE2E2" },
                alta: { DEFAULT: "#F97316", light: "#FFEDD5" },
                moderada: { DEFAULT: "#FACC15", light: "#FEF9C3" },
                baixa: { DEFAULT: "#22C55E", light: "#DCFCE7" },
                brand: {
                    50: "#EFF6FF",
                    500: "#3B82F6",
                    600: "#2563EB",
                    700: "#1D4ED8",
                    900: "#1E3A5F",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
