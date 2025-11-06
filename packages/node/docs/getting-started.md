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

## Troubleshooting / FAQ

---

### My environment variables aren’t changing on Windows

Changes made through the `UserEnvironment` or `SystemEnvironment` classes affect **future processes only** — not the currently running one.
Restart your shell or application to apply updated values.

---

### “Access Denied” when editing system variables

System-level edits require **administrator privileges**.
Run your terminal as Administrator (Windows) or use `sudo` (Linux/macOS).

---

### The `ProcessRegistry` doesn’t show my process after exit

Once a process terminates, its PID becomes invalid. The registry keeps only metadata, not active tracking, use `ProcessMonitor` for real-time checks.

---

### Where can I report issues or request features?

You can report issues or request new features directly on GitHub:
[octovel/environment Issues](https://github.com/octovel/environment/issues)
