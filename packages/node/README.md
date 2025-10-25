# @octovel/environment

A lightweight and cross-platform Node.js library to safely interact with the system, **user**, and **process** environment through a unified, **type-safe API**.

---

## Classes

* **[`ProcessRegistry`](source/classes/process/ProcessRegistry.ts)** – Track and manage active child processes.  
* **[`ProcessMonitor`](source/classes/process/ProcessMonitor.ts)** – Monitor process health and uptime.  
* **[`ProcessManager`](source/classes/process/ProcessManager.ts)** – Manage environment variables with hooks, temporary/conditional values, and hashing.  
* **[`ProcessController`](source/classes/process/ProcessController.ts)** – Control and manage processes.  

* **[`UserEnvironment`](source/classes/user/UserEnvironment.ts)** – Manage user-specific environment variables.  
* **[`SystemEnvironment`](source/classes/system/SystemEnvironment.ts)** – Manage system-specific environment variables.

This library also provides some types to work with environment variables, and provided classes through the API.

---

## Documentation

* [ProcessRegistry Guide](docs/guides/process-registry.md)
* [ProcessMonitor Guide](docs/guides/process-monitor.md)
* [ProcessManager Guide](docs/guides/process-manager.md)
* [ProcessController Guide](docs/guides/process-controller.md)
* [UserEnvironment Guide](docs/guides/user-environment.md)
* [SystemEnvironment Guide](docs/guides/system-environment.md)

---

## Features

* Type-safe API for all environment operations
* Hooks for add, update, delete, and clear events
* Temporary and conditional variables
* Hashing/encryption support for sensitive values
* Cross-platform support: Windows, Linux, macOS

---

## Getting Started

Install via your preferred package manager:

```bash
npm install @octovel/environment
# or
yarn add @octovel/environment
# or
pnpm add @octovel/environment
```

# Examples:

Here are some usage examples of the classes.

## SystemEnvironment
```ts
import { SystemEnvironment, WindowsRegistryType, Platform } from "@octovel/environment";

interface MySystemEnv {
  PATH: string;
  JAVA_HOME: string;
  NODE_ENV: string;
}

const env = new SystemEnvironment<MySystemEnv>(Platform.Windows);

// Set variable
env.set("JAVA_HOME", "C:\\Program Files\\Java", {
  type: WindowsRegistryType.REG_EXPAND_SZ,
});

// Get variable
const javaPath = env.get("JAVA_HOME", { defaultValue: "NotFound" });
console.log("JAVA_HOME =", javaPath);

// List variables
console.log("Keys:", env.listKeys());
console.log("Values:", env.listValues());

// Save backup
await env.saveToFile("./system-env.json");

// Remove variable
env.remove("JAVA_HOME");
```

## UserEnvironment
```ts
import { UserEnvironment, Platform, WindowsRegistryType } from "@octovel/environment";

interface MyEnvironment {
  [key: string]: string;
  TEST_PATH: string;
  NODE_ENV: string;
}

const env = new UserEnvironment<MyEnvironment>(Platform.Windows);

// Set variable
env.set("TEST_PATH", "%ProgramFiles%\\MyApp", {
  type: WindowsRegistryType.REG_EXPAND_SZ,
});

// Get variable
const val = env.get("TEST_PATH");
console.log("TEST_PATH =", val);

// List variables
console.log("Keys:", env.listKeys());
console.log("Values:", env.listValues());

// Save backup
await env.saveToFile("./user-env.json");

// Remove variable
env.remove("TEST_PATH");
```


##  ProcessManager
```ts
import { ProcessManager } from "@octovel/environment";

interface EnvSchema {
  NODE_ENV: string;
  API_KEY?: string;
}

const manager = new ProcessManager<EnvSchema>();

// Set variables
manager.set("NODE_ENV", "development");
manager.setTemporary("API_KEY", "secret", { ttl: 5000 }); // 5 seconds

// Get variables
console.log(manager.get("NODE_ENV")); // "development"

// Hooks
manager.onAdd((key, value) => console.log(`Added ${key}=${value}`));

// Snapshot & restore
const snap = manager.snapshot();
manager.set("NODE_ENV", "production");
manager.restore(snap);

// Increment numeric value
manager.set("COUNTER", 1);
manager.increment("COUNTER", 2); // COUNTER = 3
```

## ProcessController
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

## ProcessMonitor
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

## ProcessRegistry
```ts
import { ProcessRegistry } from "@octovel/environment";
import { spawn } from "node:child_process";

const registry = new ProcessRegistry();
const proc = spawn("node", ["app.js"]);

registry.add({ pid: proc.pid!, command: "node", args: ["app.js"], name: "App Server" }, proc);

console.log("Registered:", registry.count());

const record = registry.get(proc.pid!);
console.log("Process info:", record);

registry.remove(proc.pid!);
console.log("Remaining:", registry.count());
```


---

## License

Apache-2.0 © [Octovel](https://github.com/octovel)
