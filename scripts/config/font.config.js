module.exports = {
  name: "mozart-icons",
  prefix: "m",
  distDir: "scripts/font/fonts",
  svgDir: "scripts/font/svg",
  dxFontDir: "scripts/font/icons",
  defaultFontDir: "scripts/font/default",
  distInfo: {
    first: "src",
    second: "fonts",
    dx: "styles/css/icons",
    default: "default_font",
  },
  copyInfos: [
    {
      project: "common-ui",
      dir: "libraries",
      monorepo: "aleatorik-ui",
    },
    {
      project: "mozart-component-dev",
      dir: "libraries",
    },
    {
      project: "mozart-component-wijmo",
      dir: "libraries",
    },
    {
      project: "standard",
      dir: "packages",
      monorepo: "internal",
    },
  ],
};
