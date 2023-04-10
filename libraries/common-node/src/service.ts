import path from "path";
import { spawn } from "child_process";

export const installService = async (target: string, type: string) => {
  if (process.platform === "win32") {
    return new Promise(resolve => {
      console.log(path.join(target, type, "WinSW.exe"), path.join(target, `${type}.yml`));
      const cp = spawn(path.join(target, type, "WinSW.exe"), ["install", "-p", path.join(target, type, `${type}.yml`)]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } else if (process.platform === "linux") {
    return new Promise(resolve => {
      const cp = spawn("cp", [path.join(target, type), "/lib/systemd/system/"]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          const reload = spawn("systemctl", ["daemon-reload"]);
          reload.on("close", code => {
            if (code === 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }
};

export const uninstallService = (target: string, type: string) => {
  if (process.platform === "win32") {
    return new Promise(resolve => {
      const cp = spawn(path.join(target, type, "WinSW.exe"), [
        "uninstall",
        "-p",
        path.join(target, type, `${type}.yml`),
      ]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } else if (process.platform === "linux") {
    return new Promise(resolve => {
      const cp = spawn("rm", ["-rf", path.join("/lib/systemd/system/", type)]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          const reload = spawn("systemctl", ["daemon-reload"]);
          reload.on("close", code => {
            if (code === 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }
};

export const startService = (target: string, type: string) => {
  if (process.platform === "win32") {
    return new Promise(resolve => {
      const cp = spawn(path.join(target, type, "WinSW.exe"), ["start", "-p", path.join(target, type, `${type}.yml`)]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } else if (process.platform === "linux") {
    return new Promise(resolve => {
      const cp = spawn("systemctl", ["start", type]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
};

export const stopService = (target: string, type: string) => {
  if (process.platform === "win32") {
    return new Promise(resolve => {
      const cp = spawn(path.join(target, type, "WinSW.exe"), ["stop", "-p", path.join(target, type, `${type}.yml`)]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } else if (process.platform === "linux") {
    return new Promise(resolve => {
      const cp = spawn("systemctl", ["stop", type]);

      cp.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
      });

      cp.on("close", code => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
};
