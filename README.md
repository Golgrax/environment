# Environment-Node

A lightweight and cross-platform Node.js library to safely interact with the **system**, **user**, and **process** environment through a unified, **type-safe API**.

---

## Classes

* **[`ProcessRegistry`](guides/process-registry.md)** – Track and manage active child processes.  
* **[`ProcessMonitor`](guides/process-monitor.md)** – Monitor process health and uptime.  
* **[`ProcessManager`](guides/process-manager.md)** – Manage environment variables with hooks, temporary/conditional values, and hashing.  
* **[`ProcessController`](guides/process-controller.md)** – Control and manage processes.  

* **[`UserEnvironment`](guides/user-environment.md)** – Manage user-specific environment variables.  
* **[`SystemEnvironment`](guides/system-environment.md)** – Manage system-specific environment variables.  

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

* [ProcessRegistry Guide](guides/process-registry.md)
* [ProcessMonitor Guide](guides/process-monitor.md)
* [ProcessManager Guide](guides/process-manager.md)
* [ProcessController Guide](guides/process-controller.md)
* [UserEnvironment Guide](guides/user-environment.md)
* [SystemEnvironment Guide](guides/system-environment.md)

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
