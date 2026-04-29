/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F4EFE6",
        ink: "#1F2937",
        coral: "#E76F51",
        teal: "#2A9D8F",
        gold: "#E9C46A",
        mist: "#F8FAFC",
        slate: "#64748B",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        display: ["Georgia"],
        body: ["System"],
      },
    },
  },
  plugins: [],
};
