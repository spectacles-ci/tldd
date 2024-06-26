/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#1C73E8",
                "primary-interactive": "#2d7eea",
                success: "#34A853",
                danger: "#EA4336",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
