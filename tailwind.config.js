/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--ion-color-primary)",
        secondary: "var(--ion-color-secondary)",
        tertiary: "var(--ion-color-tertiary)",
        success: "var(--ion-color-success",
        warning: "var(--ion-color-warning)",
        danger: "var(--ion-color-danger)",
        light: "var(--ion-color-light)",
        medium: "var(--ion-color-medium)",
        dark: "var(--ion-color-dark)",
      },
    },
  },
  plugins: [],
};
