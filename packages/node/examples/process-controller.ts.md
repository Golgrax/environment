```ts
import { ProcessController } from "@octovel/environment";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

const controller = new ProcessController<ChildProcessWithoutNullStreams>();

// Start a background process
const proc = controller.start("node", ["--version"]);

proc.stdout.on("data", (chunk) => console.log("Output:", chunk.toString()));

// Check if alive
console.log("Is running:", controller.isRunning(proc));

// Restart the process
controller.restart(proc, "node", ["--version"], { cwd: process.cwd(), env: proc.env });

// Stop after delay
setTimeout(() => {
  controller.stop(proc);
  console.log("Process stopped.");
}, 2000);
```
