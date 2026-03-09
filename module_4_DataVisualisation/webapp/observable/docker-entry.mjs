import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

async function main() {
  const pkgPath = resolve("node_modules/@observablehq/framework/package.json");
  const pkgRaw = await readFile(pkgPath, "utf8");
  const pkg = JSON.parse(pkgRaw);

  const bin =
    typeof pkg.bin === "string"
      ? pkg.bin
      : pkg.bin && (pkg.bin.observable || pkg.bin["observable"]);

  if (!bin) {
    throw new Error("Cannot resolve @observablehq/framework CLI bin.");
  }

  const binPath = resolve("node_modules/@observablehq/framework", bin);
  const child = spawn(
    process.execPath,
    [binPath, "preview", "--host", "0.0.0.0", "--port", "3002"],
    { stdio: "inherit" }
  );

  child.on("exit", code => process.exit(code ?? 1));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
