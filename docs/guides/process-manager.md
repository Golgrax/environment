## Overview

The `ProcessManager` class provides a **comprehensive API for managing environment variables**, including:

* Standard get/set operations for environment variables.
* Hooks for lifecycle events (`add`, `update`, `delete`, `clear`, `change`).
* Temporary variables with expiration.
* Conditional and hashed variable management.
* Snapshots and restoration of environment states.
* Utilities for numeric and computed values.

It is designed to **abstract environment manipulation**, providing safe, extensible, and observable operations, especially useful in CLI tools, build orchestrators, and process management frameworks.

**Source:** [`source/classes/process/ProcessManager.ts`](https://github.com/octovel/environment-node/blob/stable/source/classes/process/ProcessManager.ts)

---

## Constructor

```ts
new ProcessManager<S extends IEnvironmentSchema>()
```

Creates a new instance capable of managing environment variables of type `S`.

### Example

```ts
import { ProcessManager } from "@octovel/environment";

interface EnvSchema {
  NODE_ENV: string;
  API_KEY?: string;
}

const manager = new ProcessManager<EnvSchema>();
```

---

## Key Features

### 1. Environment Operations

* **set(key, value):** Set or update variables.
* **get(key, options?):** Retrieve a value with optional fallback.
* **has(key):** Check existence.
* **delete(key):** Remove a variable.
* **list(options?):** List all keys or key-value pairs.
* **filterKeys / filterValues:** Filter variables based on custom predicates.

These methods provide **basic CRUD operations** on environment variables with optional observation hooks.

---

### 2. Snapshots

* **snapshot():** Capture current environment state.
* **restore(snapshot):** Restore environment from a previous snapshot.

Useful for temporarily changing environment configurations and reverting safely.

---

### 3. Hooks & Observability

Supports lifecycle hooks for environment changes:

* `onAdd(callback)`
* `onUpdate(callback)`
* `onDelete(callback)`
* `onClear(callback)`
* `on(type, callback)` — generic subscription for any event type.

Hooks allow developers to **react automatically** when variables are added, updated, deleted, or cleared.

---

### 4. Temporary & Conditional Variables

* **setTemporary(key, value, options):** Store a variable for a limited TTL.
* **setConditional(key, value, condition):** Set variable only if condition is true.
* **setHashed / setEncryptedConditional:** Store one-way hashed variables with optional conditions.

Includes **automatic cleanup** of expired temporary variables (`cleanExpired()`).

---

### 5. Utilities

* **getOrDefault / getOrCompute:** Retrieve or compute values dynamically.
* **increment / decrement / compute:** Numeric helpers for counters.
* **reset():** Clear all variables and temporary data.
* **print() / printPretty():** Output environment state for debugging.

---

## Type Parameters

| Type Parameter | Constraint           | Description                                      |
| -------------- | -------------------- | ------------------------------------------------ |
| `S`            | `IEnvironmentSchema` | The environment schema defining key/value types. |

---

## Example Usage

```ts
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

---

## Best Practices

* Use hooks for reactive workflows rather than polling `process.env`.
* Prefer snapshots for temporary changes to avoid state inconsistencies.
* Use temporary variables for ephemeral secrets or TTL-based values.
* Always validate schema `S` to ensure type safety across operations.

---

## Reliability & Safety

* Designed for **in-memory management**; does not persist to disk.
* Safe for CLI tools and ephemeral processes.
* One-way hashed variables are non-reversible; for sensitive values, use hashes instead of plain text.
