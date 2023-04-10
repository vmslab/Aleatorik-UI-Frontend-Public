module.exports = {
  workspace: "mozart-ui-framework-dev",
  srcDir: "apps/mozart-ui-framework-dev/dist",
  distDir: "../MozartUIStudio/Installer/MozartUIServerInstaller/Resources/UIService/WebServer/html",
  excludes: ["doc", "image", "module", "service"],
  remote: {
    use: true,
    host: "192.168.1.141",
    user: "administrator",
    pass: "U2FsdGVkX1+uvgt/pYrHFUOyWFDlA4jHE5sJSlaGRp8=",
    distDir: "C:\\MozartUIService\\WebServer\\html",
  },
};
