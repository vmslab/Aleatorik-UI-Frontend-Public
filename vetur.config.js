module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "vetur.experimental.templateInterpolationService": false,
  },
  projects: [
    {
      root: "./libraries/mozart-component-dev",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./packages/standard",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
  ],
};
