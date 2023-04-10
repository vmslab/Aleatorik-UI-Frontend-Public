const spawn = require("child_process").spawn;

function runChild(command, callback) {
  const child = spawn("powershell.exe", [command]);

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
    console.log(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", function (data) {
    console.log(data);
  });

  child.on("close", async function (code) {
    if (code !== 0) return;
    callback();
  });
}

async function main() {
  runChild("pnpm --filter @mozart-ui/installer-cli build", () => {
    runChild("pnpm --filter @mozart-ui/installer-cli pkg", () => {
      console.log("Done!");
    });
  });
}

main();
