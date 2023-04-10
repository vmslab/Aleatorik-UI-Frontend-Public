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
      root: "./apps/mozart-ui-framework-dev",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./apps/mozart-management-console",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/ui-framework-template-dev",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/ui-framework-template-login",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/project-management-system",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/project-management-system-login",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/lab-management-system",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
    {
      root: "./templates/aleatorik-ui",
      package: "./package.json",
      tsconfig: "./tsconfig.json",
    },
  ],
};
