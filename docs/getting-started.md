# Getting Started

**Environment-Node** is a lightweight and cross-platform Node.js library that provides a unified, type-safe API to interact with your **system**, **user**, and **process** environments.

---

## Installation

You can install the package using any modern package manager:

```bash
npm install @octovel/environment
# or
yarn add @octovel/environment
# or
pnpm add @octovel/environment
```

---

## Basic Usage

Here’s a simple example demonstrating how to register and monitor a process:

```ts
import { spawn } from "node:child_process";
import { ProcessRegistry, ProcessMonitor } from "@octovel/environment";

const registry = new ProcessRegistry();
const monitor = new ProcessMonitor();

const proc = spawn("node", ["--version"]);

registry.add({ pid: proc.pid!, name: "Node Version", command: "node", args: ["--version"] }, proc);

const record = registry.get(proc.pid!);
console.log("Process registered:", record);

console.log("Is alive:", monitor.isAlive(proc));
```

---

## Recommended Guides

To learn more about specific features, see:

* [ProcessRegistry](./guides/process-registry.md)
* [ProcessMonitor](./guides/process-monitor.md)
* [ProcessManager](./guides/process-manager.md)
* [UserEnvironment](./guides/user-environment.md)
* [SystemEnvironment](./guides/system-environment.md)

---

## Requirements

* **Node.js:** v18 or later
* **Platform:** Windows, Linux, or macOS
* **Language:** TypeScript (fully supported)
