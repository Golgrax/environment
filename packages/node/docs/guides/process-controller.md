## Overview

The `ProcessController` class provides robust, type-safe methods for managing child processes in Node.js.
It supports starting, stopping, restarting, and inspecting system processes. Allowing you to integrate background tasks, automation scripts, or subprocess orchestration into your applications.

Unlike lower-level wrappers around `spawn()`, this class enforces clean error handling, strong typing, and consistent process management patterns across different environments.

**Source:** [`source/classes/process/ProcessController.ts`](https://github.com/octovel/environment/blob/stable/source/classes/process/ProcessController.ts)

---

## Constructor

```ts
new ProcessController<P extends ChildProcess>()
```

Creates a new `ProcessController` instance capable of managing one or more processes of type `ChildProcess`.

### Example

```ts
import { ProcessController } from "@octovel/environment";

const controller = new ProcessController();
```

---

## Methods

### 1. `start(command, args, options?)`

```ts
start(
  command: string,
  args: Readonly<Array<string>>,
  options?: IProcessControllerOptions
): ChildProcessWithoutNullStreams
```

Starts a new child process with the specified command and arguments.

#### Parameters

| Name      | Type                        | Description                                                      |
| --------- | --------------------------- | ---------------------------------------------------------------- |
| `command` | `string`                    | The executable command to run.                                   |
| `args`    | `Readonly<Array<string>>`   | Arguments to pass to the executable.                             |
| `options` | `IProcessControllerOptions` | Optional configuration for `cwd`, `env`, or `detached` behavior. |

#### Returns

A `ChildProcessWithoutNullStreams` instance representing the running process.

#### Example

```ts
import { ProcessController } from "@octovel/environment";

const proc = new ProcessController().start("node", ["--version"]);
proc.stdout.on("data", (chunk) => console.log(chunk.toString()));
```

#### Behavior

* Uses Node.js’s `spawn()` with `stdio: "pipe"` to capture I/O streams.
* Returns immediately; the process runs asynchronously.
* Throws an exception if process creation fails.

#### Best Practices

* Always attach event listeners (`stdout`, `stderr`, `exit`) to handle output and lifecycle.
* Avoid using `spawn()` for commands that require shell parsing, use `child_process.exec()` in those cases.

---

### 2. `stop(process, signal?)`

```ts
stop(process: P, signal?: NodeJS.Signals): boolean
```

Attempts to gracefully stop a running process.

#### Parameters

| Name      | Type             | Description                             |
| --------- | ---------------- | --------------------------------------- |
| `process` | `ChildProcess`   | The process to terminate.               |
| `signal`  | `NodeJS.Signals` | Optional signal (default: `"SIGTERM"`). |

#### Returns

`true` if the signal was successfully sent, otherwise `false`.

#### Example

```ts
const controller = new ProcessController();
const proc = controller.start("ping", ["localhost"]);

setTimeout(() => {
  const stopped = controller.stop(proc);
  console.log("Stopped:", stopped);
}, 3000);
```

#### Behavior

* Sends the specified signal using `process.kill()`.
* Returns `false` if an exception occurs (e.g., invalid PID or insufficient permissions).

#### Best Practices

* Use `"SIGINT"` for user-interrupt simulations and `"SIGTERM"` for graceful termination.
* Avoid `"SIGKILL"` unless absolutely necessary, as it prevents cleanup hooks from running.

---

### 3. `restart(process, command, args, options?)`

```ts
restart(
  process: P,
  command: string,
  args: Readonly<Array<string>>,
  options?: IProcessControllerOptions
): ChildProcessWithoutNullStreams
```

Stops a currently running process and starts a new one immediately.

#### Parameters

| Name      | Type                        | Description                                 |
| --------- | --------------------------- | ------------------------------------------- |
| `process` | `ChildProcess`              | The existing process to stop.               |
| `command` | `string`                    | The command to run after restart.           |
| `args`    | `Readonly<Array<string>>`        | Arguments to pass to the new process.       |
| `options` | `IProcessControllerOptions` | Optional configuration for the new process. |

#### Returns

A new `ChildProcessWithoutNullStreams` instance representing the restarted process.

#### Example

```ts
const controller = new ProcessController();
let proc = controller.start("node", ["server.js"]);

// Restart after 5 seconds
setTimeout(() => {
  proc = controller.restart(proc, "node", ["server.js"]);
  console.log("Process restarted");
}, 5000);
```

#### Behavior

* Stops the existing process with `SIGTERM`.
* Immediately spawns a new process with the same or new arguments.
* Returns the new instance.

#### Best Practices

* Use this for lightweight restart cycles, like reloading a development server.
* If your restart involves async cleanup (e.g., closing files or sockets), subclass and override with an async version returning `Promise<boolean>`.

---

### 4. `isRunning(process)`

```ts
isRunning(process: P): boolean
```

Checks whether a given process is currently alive.

#### Parameters

| Name      | Type           | Description                         |
| --------- | -------------- | ----------------------------------- |
| `process` | `ChildProcess` | The process to check for aliveness. |

#### Returns

`true` if the process is alive, `false` otherwise.

#### Example

```ts
const controller = new ProcessController();
const proc = controller.start("ping", ["localhost"]);

setInterval(() => {
  console.log("Alive:", controller.isRunning(proc));
}, 1000);
```

#### Behavior

* Internally uses `process.kill(pid, 0)`, a harmless signal used only to test existence.
* Handles `ESRCH` (no process found) and `EPERM` (permission denied, but alive) cases.

#### Best Practices

* Works reliably on all major platforms (Windows, Linux, macOS).
* Do not call this too frequently on short-lived processes,  polling too fast may waste resources.

---

## Type Parameters

| Type Parameter | Constraint             | Description                                |
| -------------- | ---------------------- | ------------------------------------------ |
| `P`            | `extends ChildProcess` | Represents the process type being managed. |

---

## Related Types

### `IProcessControllerOptions`

Interface for additional process control options.

```ts
interface IProcessControllerOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  detached?: boolean;
}
```

* `cwd` — Working directory for the process.
* `env` — Custom environment variables.
* `detached` — Runs the process independently of its parent.

---

## Error Handling

* All methods catch runtime exceptions from Node’s `child_process` API.
* Errors are logged to `stderr` via `console.error()` and rethrown when necessary.
* The `start()` and `restart()` methods will throw if process creation fails.

---

## Example Usage

```ts
import { ProcessController } from "@octovel/environment";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

const controller = new ProcessController<ChildProcessWithoutNullStreams>();

// Start a background process
const proc = controller.start("node", ["--version"]);

proc.stdout.on("data", (chunk) => console.log("Output:", chunk.toString()));

// Check if alive
console.log("Is running:", controller.isRunning(proc));

// Stop after delay
setTimeout(() => {
  controller.stop(proc);
  console.log("Process stopped.");
}, 2000);
```

---

## Best Practices

* Always handle process I/O streams, unhandled streams can cause memory leaks.
* Use this class in CLI tools, environment managers, or background task schedulers.
* Prefer spawning **detached** processes only when your parent script should exit while leaving the child alive.
* For long-running daemons or services, integrate with your system’s supervisor (e.g., systemd, PM2) instead.

---

## Reliability & Safety

* `SIGTERM` is the safest and most compatible stop signal.
* Processes may remain as zombies if streams are not properly consumed or the parent exits early.
* Use `proc.on("exit")` or `proc.on("close")` to cleanly manage lifecycles.
