# Environment-Node

A lightweight and cross-platform Node.js library to safely interact with the **system**, **user**, and **process** environment through a unified, **type-safe API**.

---

## Classes

* **[`ProcessRegistry`](source/classes/process/ProcessRegistry.ts)** – Track and manage active child processes.  
* **[`ProcessMonitor`](source/classes/process/ProcessMonitor.ts)** – Monitor process health and uptime.  
* **[`ProcessManager`](source/classes/process/ProcessManager.ts)** – Manage environment variables with hooks, temporary/conditional values, and hashing.  
* **[`ProcessController`](source/classes/process/ProcessController.ts)** – Control and manage processes.  

* **[`UserEnvironment`](source/classes/user/UserEnvironment.ts)** – Manage user-specific environment variables.  
* **[`SystemEnvironment`](source/classes/system/SystemEnvironment.ts)** – Manage system-specific environment variables.  

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

Basic usage:

```ts
import { ProcessManager } from "@octovel/environment";

const env = new ProcessManager<{ NODE_ENV: string }>();
env.set("NODE_ENV", "development");

console.log(env.get("NODE_ENV")); // "development"
```

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

## License

Apache-2.0 © [Octovel](https://github.com/octovel)
