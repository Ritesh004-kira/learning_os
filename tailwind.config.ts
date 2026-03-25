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
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            colors: {
                surface: {
                    DEFAULT: "#0d0d0f",
                    raised: "#111114",
                    overlay: "#16161a",
                    border: "#1e1e24",
                },
                accent: {
                    DEFAULT: "#7c3aed",
                    hover: "#6d28d9",
                    muted: "#7c3aed1a",
                    subtle: "#7c3aed33",
                },
                text: {
                    primary: "#f0f0f3",
                    secondary: "#8b8b99",
                    muted: "#4a4a56",
                },
            },
            spacing: {
                sidebar: "240px",
                topbar: "52px",
            },
        },
    },
    plugins: [],
};

export default config;
