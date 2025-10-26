## Overview

The `ProcessRegistry` class provides an in-memory registry for tracking and managing active process metadata.
It allows you to store, retrieve, and manipulate records of running `ChildProcess` instances with associated metadata, such as process name, command, arguments, and timestamps.

This class is particularly useful when managing multiple background processes, enabling consistent bookkeeping for monitoring, cleanup, or orchestration logic.

**Source:** [`source/classes/process/ProcessRegistry.ts`](https://github.com/octovel/environment-node/blob/stable/source/classes/process/ProcessRegistry.ts)

---

## Constructor

```ts
new ProcessRegistry<P extends ChildProcess = ChildProcess>()
```

Creates a new, empty registry instance for tracking child processes.

### Example

```ts
import { ProcessRegistry } from "@octovel/environment";

const registry = new ProcessRegistry();
```

---

## Internal Structure

### `registry`

```ts
private readonly registry: Map<number, IProcessInfo & { instance: P }>;
```

A private map that associates process IDs (`pid`) with their metadata and `ChildProcess` instance.

* Keys: `pid` (number)
* Values: `IProcessInfo` merged with `{ instance: P }`

Used internally to ensure fast lookups and safe management of registered processes.

---

## Methods

### 1. `add(info, instance)`

```ts
add(info: IProcessInfo, instance: P): void
```

Registers a process and its associated metadata into the registry.
If a process with the same PID already exists, an error is thrown.

#### Parameters

| Name       | Type           | Description                                         |
| ---------- | -------------- | --------------------------------------------------- |
| `info`     | `IProcessInfo` | Metadata describing the process (name, args, etc.). |
| `instance` | `P`            | The actual `ChildProcess` instance.                 |

#### Example

```ts
import { ProcessRegistry } from "@octovel/environment";
import { spawn } from "node:child_process";

const registry = new ProcessRegistry();
const proc = spawn("node", ["--version"]);

registry.add({ pid: proc.pid!, command: "node", args: ["--version"], name: "Node Version" }, proc);
```

#### Behavior

* Prevents duplicate registration using the same PID.
* Stores both metadata and runtime instance for later inspection.

#### Best Practices

* Always ensure the `pid` is valid before calling `add()`.
* Do not reuse `pid`s manually; let the OS handle process identifiers.

---

### 2. `remove(pid)`

```ts
remove(pid: number): boolean
```

Removes a process record from the registry.

#### Parameters

| Name  | Type     | Description                             |
| ----- | -------- | --------------------------------------- |
| `pid` | `number` | Process ID to remove from the registry. |

#### Returns

`true` if the process was successfully removed, otherwise `false`.

#### Example

```ts
const removed = registry.remove(proc.pid!);
console.log("Removed:", removed);
```

#### Behavior

* Safe to call even if the PID is not present.
* Does not affect the actual process — only removes metadata tracking.

---

### 3. `get(pid)`

```ts
get(pid: number): Readonly<IProcessInfo & { instance: P }> | undefined
```

Retrieves detailed information about a specific process.

#### Parameters

| Name  | Type     | Description                          |
| ----- | -------- | ------------------------------------ |
| `pid` | `number` | The process ID to retrieve info for. |

#### Returns

A frozen (immutable) record combining process metadata and the running instance, or `undefined` if not found.

#### Example

```ts
const record = registry.get(proc.pid!);
console.log(record?.command, record?.args);
```

#### Behavior

* Returns a frozen object to prevent accidental modification.
* Designed for read-only inspection of registry data.

---

### 4. `list()`

```ts
list(): readonly Readonly<IProcessInfo & { instance: P }>[]
```

Returns all registered processes as an immutable array.

#### Returns

A readonly array of all stored records.

#### Example

```ts
const processes = registry.list();
for (const proc of processes) {
  console.log(`[${proc.pid}] ${proc.command} ${proc.args.join(" ")}`);
}
```

#### Behavior

* Snapshot-based — does not reflect future changes unless re-invoked.
* Returned objects are frozen for safety.

#### Best Practices

* Ideal for diagnostics or exporting registry state.
* Avoid mutating returned objects; they are intentionally immutable.

---

### 5. `exists(pid)`

```ts
exists(pid: number): boolean
```

Checks if a process with the specified PID exists in the registry.

#### Parameters

| Name  | Type     | Description                 |
| ----- | -------- | --------------------------- |
| `pid` | `number` | The process ID to look for. |

#### Returns

`true` if a record exists for the PID, `false` otherwise.

#### Example

```ts
if (registry.exists(proc.pid!)) {
  console.log("Process is tracked in registry.");
}
```

#### Behavior

* O(1) lookup time using `Map.has()`.
* Purely internal — does not verify if the actual process is alive.

---

### 6. `clear()`

```ts
clear(): number
```

Removes **all** entries from the registry.

#### Returns

The number of entries that were cleared.

#### Example

```ts
const removedCount = registry.clear();
console.log(`Cleared ${removedCount} processes from registry.`);
```

#### Behavior

* Permanently deletes all stored records.
* Does **not** terminate any active processes — this is purely a bookkeeping reset.

#### Best Practices

* Use this before shutdown or reinitialization to release references.
* Avoid frequent clearing to prevent loss of diagnostic data.

---

### 7. `count()`

```ts
count(): number
```

Returns the total number of processes currently registered.

#### Example

```ts
console.log("Process count:", registry.count());
```

#### Behavior

* Equivalent to `registry.size` internally.
* Useful for monitoring and metrics dashboards.

---

## Type Parameters

| Type Parameter | Constraint             | Description                                          |
| -------------- | ---------------------- | ---------------------------------------------------- |
| `P`            | `extends ChildProcess` | Represents the specific `ChildProcess` type managed. |

---

## Related Types

### `IProcessInfo`

Metadata interface describing a tracked process.

```ts
export interface IProcessInfo {
  /** The process ID. */
  pid: number;
  /** The command used to start the process. */
  command: string;
  /** The arguments used to start the process. */
  args: string[];
  /** The status of the process. */
  status: ProcessStatus;
  /** The date and time when the process was started. */
  startedAt: Date | number;
  /** The date and time when the process was stopped. */
  stoppedAt?: Date | number;
  /** The exit code of the process. */
  exitCode?: number | null;
  /** The CPU usage of the process. */
  cpuUsage?: NodeJS.CpuUsage;
  /** The memory usage of the process. */
  memoryUsage?: NodeJS.MemoryUsage;
  /** The environment variables of the process. */
  environment?: Record<string, string>;
}
```

---

## Example Usage

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

## Best Practices

* Treat this as a **state manager**, not a process monitor — it does not check process health.
* Pair it with `ProcessController` to handle process lifecycle operations.
* Always validate your metadata structure before calling `add()` to prevent invalid state.
* Use `list()` and `saveToFile()` (if you extend this class) to persist registry states between sessions.

---

## Reliability & Safety

* All data is stored **in-memory only**; restarting your application resets the registry.
* No external resources or files are used.
* Suitable for use in process managers, CLI tools, and build orchestrators.
