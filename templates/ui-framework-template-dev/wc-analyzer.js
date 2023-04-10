const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WSAnalyzerPlugin {
  pluginName = "wc-analyzer";
  pgName = "";
  sourceDir = "";
  outputFilePath = "";
  webComponents = [];
  constructor(options = {}) {
    const cwd = process.cwd();
    this.sourceDir = path.join(cwd, options.sourceDir);
    this.outputFilePath = path.join(cwd, options.outputDir, options.fileName);
    this.pgName = options.pgName;
  }
  apply(compiler) {
    let html = undefined;
    for (const pg of compiler.options.plugins) {
      if (pg instanceof HtmlWebpackPlugin) {
        html = pg;
        html.options.components = [];
      }
    }
    compiler.hooks.normalModuleFactory.tap(this.pluginName, factory => {
      let handler = (parser, options) => {
        parser.hooks.program.tap(this.pluginName, ast => {
          const module = parser.state.module;
          if (module.resource.startsWith(this.sourceDir)) {
            const nodes = ast.body.filter(node => {
              if (JSON.stringify(node).includes("defineWebComponents")) {
                if (node.type === "ExpressionStatement") {
                  if (node.expression.type === "CallExpression") {
                    return node.expression.callee && node.expression.callee.type;
                  }
                }
              }
            });
            nodes.forEach(node => {
              const argNode = node.expression.arguments[0];
              if (argNode && argNode.type === "ObjectExpression") {
                const ws = {};
                for (const prop of argNode.properties) {
                  if (prop.key.name === "id") {
                    const name = `${this.pgName}-${prop.value.value}`;
                    ws[prop.key.name] = name;
                    html.options.components.push(name);
                  } else if (prop.key.name === "params") {
                    const params = {};
                    for (const element of prop.value.elements) {
                      params[element.properties[0].value.value] = element.properties[1].value.value;
                    }
                    ws[prop.key.name] = params;
                  } else {
                    ws[prop.key.name] = prop.value.value;
                  }
                }
                this.webComponents.push(ws);
              }
            });
          }
        });
      };
      factory.hooks.parser.tap("javascript/auto", this.pluginName, handler);
      factory.hooks.parser.tap("javascript/dynamic", this.pluginName, handler);
      factory.hooks.parser.tap("javascript/esm", this.pluginName, handler);
    });
    compiler.hooks.done.tap(this.pluginName, stats => {
      if (fs.existsSync(path.dirname(this.outputFilePath))) {
        fs.writeFileSync(
          this.outputFilePath,
          JSON.stringify({
            plugin: this.pgName,
            components: this.webComponents,
          }),
          "utf8",
        );
      }
    });
  }
}

module.exports = WSAnalyzerPlugin;
