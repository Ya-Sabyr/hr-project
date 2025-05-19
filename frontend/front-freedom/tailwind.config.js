const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brightBlue: "#0062FF",
        muteGray: "#9C9CA3",
        deepBlue: "#0052D4",
        secondaryColor: "#686868",
        waitYellow: "#DEB200",
        rejectRed: "#AF0000",
        acceptGreen:"#226539",
      },
      fontFamily: {
        rubik: ["Rubik", "sans-serif"],
      },
    },
  },
  plugins: [],
};

module.exports = config;
