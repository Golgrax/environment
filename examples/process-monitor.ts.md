```ts
import { spawn } from "node:child_process";
import { ProcessMonitor } from "@octovel/environment";

// Spawn a child process
const proc = spawn("node", ["--version"]);

// Initialize monitor
const monitor = new ProcessMonitor();

// Check process health
if (monitor.isAlive(proc)) {
  console.log("Process is running.");
}

// Calculate uptime
const startTime = Date.now();
setTimeout(() => {
  const uptime = monitor.getUptime(proc, startTime);
  console.log(`Process uptime: ${uptime}ms`);
}, 5000);
```
