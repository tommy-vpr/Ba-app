// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        softBlack: "#1C1C1C",
        charcoal: "#111111",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
