/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,md}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ["Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        green: "#b9ff66",
        dark: "#191a23",
        gray: "#f3f3f3",
      },
      boxShadow: {
        card: "0px 5px 0px #191a23",
      },
      borderRadius: {
        card: "45px",
      },
    },
  },
  plugins: [],
};
