module.exports = {
  distDir: "../MozartUIStudio/Template/ui-framework-web-template",
  root: {
    excludes: [
      ".git",
      ".vscode",
      "node_modules",
      "apps",
      "libraries",
      "templates",
      "scripts",
      "mozart-ui.code-workspace",
      "yarn.lock",
      "pnpm-lock.yaml",
    ],
  },
  packages: {
    paths: ["libraries", "templates"],
    includes: [
      "common",
      "common-ui",
      "mozart-common",
      "mozart-component-dev",
      "mozart-component-wijmo",
      "mozart-dev",
      "ui-framework-template-dev",
      "ui-framework-template-login",
    ],
    excludes: ["node_modules", "lib", "storybook-static", "dist"],
  },
};
