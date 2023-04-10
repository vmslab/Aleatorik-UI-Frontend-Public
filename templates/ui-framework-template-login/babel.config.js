module.exports = {
  presets: [
    [
      "@vue/app",
      {
        useBuiltIns: "entry",
        modules: false,
      },
    ],
  ],
  plugins: ["lodash"],
};
