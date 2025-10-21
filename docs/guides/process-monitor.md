## Overview

The `ProcessMonitor` class provides **utility methods** to observe and monitor the state of Node.js `ChildProcess` instances.
It focuses on **lightweight process monitoring**, allowing you to:

* Check whether a process is alive.
* Calculate uptime of running processes.
* Integrate process health checks into logging, diagnostics, or lifecycle orchestration.

This class is best used in combination with `ProcessRegistry` and `ProcessController` to provide a full process management suite.

**Source:** [`source/classes/ProcessMonitor.ts`](https://github.com/octovel/environment-node/blob/stable/source/classes/ProcessMonitor.ts)

---

## Constructor

```ts
new ProcessMonitor<P extends ChildProcess>()
```

Creates a new `ProcessMonitor` instance capable of observing processes of type `P`.

### Example

```ts
import { ProcessMonitor } from "@octovel/environment";
import { type ChildProcess, spawn } from "node:child_process";

const monitor = new ProcessMonitor<ChildProcess>();
const proc = spawn("node", ["--version"]);
```

---

## Methods

### 1. `isAlive(process)`

```ts
isAlive(process: P): boolean
```

Checks whether a given process is currently running.

#### Parameters

| Name      | Type | Description                             |
| --------- | ---- | --------------------------------------- |
| `process` | `P`  | The `ChildProcess` instance to monitor. |

#### Returns

| Type      | Description                                          |
| --------- | ---------------------------------------------------- |
| `boolean` | `true` if the process is running, otherwise `false`. |

#### Behavior

* Uses `process.kill(0)` to check if the process exists without sending a termination signal.
* Catches common errors:

  * `ESRCH` — process does not exist.
  * `EPERM` — insufficient permissions (process exists but cannot be signaled).
* Returns `false` if the process is invalid or already exited.

#### Example

```ts
const monitor = new ProcessMonitor();
const alive = monitor.isAlive(proc);
console.log("Process running:", alive);
```

#### Best Practices

* Use before performing operations on processes (e.g., sending signals or gathering metrics).
* Lightweight enough to call frequently but avoid very tight loops in performance-critical applications.

---

### 2. `getUptime(process, startTime)`

```ts
getUptime(process: P, startTime: number): number
```

Returns the uptime of a process in milliseconds since a provided start time.

#### Parameters

| Name        | Type     | Description                                                                      |
| ----------- | -------- | -------------------------------------------------------------------------------- |
| `process`   | `P`      | The process instance to monitor.                                                 |
| `startTime` | `number` | Timestamp in milliseconds when the process was started (typically `Date.now()`). |

#### Returns

| Type     | Description                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| `number` | Milliseconds elapsed since `startTime`. Returns `0` if the process is not alive. |

#### Behavior

* Checks if the process is alive using `isAlive()` before calculating uptime.
* If the process has exited, returns `0` instead of a negative or invalid value.

#### Example

```ts
const start = Date.now();
setTimeout(() => {
  const uptime = monitor.getUptime(proc, start);
  console.log(`Process uptime: ${uptime}ms`);
}, 3000);
```

#### Best Practices

* Always provide a reliable `startTime` when spawning processes to track accurate uptime.
* Combine with `ProcessRegistry` for multiple processes to maintain structured monitoring.

---

## Type Parameters

| Type Parameter | Constraint             | Description                                 |
| -------------- | ---------------------- | ------------------------------------------- |
| `P`            | `extends ChildProcess` | The type of `ChildProcess` being monitored. |

---

## Example Usage

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

---

## Related Classes

| Class               | Purpose                                                         |
| ------------------- | --------------------------------------------------------------- |
| `ProcessController` | Manages starting, stopping, and restarting child processes.     |
| `ProcessRegistry`   | Stores metadata and runtime instances for all active processes. |

---

## Reliability & Safety

* **Non-intrusive monitoring:** does not terminate processes.
* **Read-only observation:** methods never modify process state.
* Suitable for CLI tools, background services, or orchestration scripts.

---

## Recommendations

* Pair with `ProcessRegistry` to track processes before monitoring uptime.
* Use `isAlive()` before attempting to restart or terminate processes.
* Avoid using `getUptime()` for processes without a reliable start timestamp.
