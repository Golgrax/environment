## Overview

The `SystemEnvironment` class provides a consistent, platform-aware interface for reading, modifying, and managing system-wide environment variables.

It allows administrative-level access to environment configurations, supporting:

* Windows registry modification under `HKLM\Environment`
* Persistent variable configuration for UNIX-like systems via `/etc/environment`
* File export for backup and synchronization of system environment states

This class is designed for **administrative scripts, setup tools, and system configuration utilities** that need to alter global environment settings accessible by all users.

**Source:** [`source/classes/system/SystemEnvironment.ts`](https://github.com/octovel/environment-node/blob/stable/source/classes/system/SystemEnvironment.ts)

---

## Constructor

```ts
new SystemEnvironment<S extends Record<string, string>>(platform: Platform)
```

Creates a new `SystemEnvironment` instance for the specified platform.

### Parameters

| Name       | Type                                | Description                                           |
| ---------- | ----------------------------------- | ----------------------------------------------------- |
| `platform` | [`Platform`](https://github.com/octovel/environment-node/blob/stable/source/types/global.ts) | Platform identifier (`Windows`, `MacOS`, or `Linux`). |

### Example

```ts
import { SystemEnvironment, Platform } from "@octovel/environment";

const systemEnv = new SystemEnvironment(Platform.Linux);
```

---

## Methods

### 1. `get(name, options?)`

```ts
get<K extends keyof S>(
  name: K,
  options?: {
    defaultValue?: S[K];
    type?: WindowsRegistryType;
  }
): S[K] | undefined
```

Retrieves the value of a **system-level** environment variable.

* On **Windows**, reads from `HKLM\Environment` using `reg query`.
* On **UNIX systems**, parses `/etc/environment`.

#### Parameters

| Name                   | Type                  | Description                                    |
| ---------------------- | --------------------- | ---------------------------------------------- |
| `name`                 | `keyof S`             | Name of the environment variable.              |
| `options.defaultValue` | `S[K]`                | Fallback value if the variable does not exist. |
| `options.type`         | `WindowsRegistryType` | Registry data type (Windows only, optional).   |

#### Returns

The variable value or the provided default value if not found.

#### Example

```ts
const env = new SystemEnvironment(Platform.Windows);
const path = env.get("Path", { defaultValue: "C:\\Windows\\System32" });
```

#### Best Practices

* Always provide a `defaultValue` to ensure predictable behavior on missing keys.
* Avoid running `get()` frequently in loops; it spawns a subprocess on Windows.

---

### 2. `set(name, value, options?)`

```ts
set<K extends keyof S>(
  name: K,
  value: S[K],
  options?: { type?: WindowsRegistryType }
): void
```

Creates or updates a system environment variable.

* On **Windows**, executes `reg add HKLM\Environment`.
* On **UNIX**, writes to `/etc/environment`.

#### Parameters

| Name           | Type                  | Description                                           |
| -------------- | --------------------- | ----------------------------------------------------- |
| `name`         | `keyof S`             | The variable name to define.                          |
| `value`        | `S[K]`                | The value assigned to the variable.                   |
| `options.type` | `WindowsRegistryType` | Optional registry type (defaults to `REG_EXPAND_SZ`). |

#### Behavior

* Automatically replaces existing entries.
* Checks for write permissions before attempting to modify `/etc/environment`.

#### Example

```ts
env.set("JAVA_HOME", "C:\\Program Files\\Java", {
  type: WindowsRegistryType.REG_EXPAND_SZ,
});
```

#### Best Practices

* Requires **administrator/root privileges** on both platforms.
* On Windows, changes will not affect currently running processes.
* On Linux/macOS, a system restart or session reload may be needed.

---

### 3. `remove(name)`

```ts
remove<K extends keyof S>(name: K): void
```

Deletes a system environment variable from the registry or environment file.

#### Behavior

* On **Windows**, executes `reg delete HKLM\Environment /v <name> /f`.
* On **UNIX**, removes the corresponding line from `/etc/environment`.

#### Parameters

| Name   | Type      | Description                         |
| ------ | --------- | ----------------------------------- |
| `name` | `keyof S` | The environment variable to delete. |

#### Example

```ts
env.remove("JAVA_HOME");
```

#### Best Practices

* **Irreversible:** Once deleted, the variable is permanently removed.
* Always back up your environment using `saveToFile()` before bulk deletions.

---

### 4. `listKeys()`

```ts
listKeys(): (keyof S)[]
```

Returns a list of all defined **system-level variable names**.

#### Behavior

* On **Windows**, runs `reg query HKLM\Environment`.
* On **UNIX**, parses `/etc/environment` for variable definitions.

#### Example

```ts
const keys = env.listKeys();
console.log(keys); // ["PATH", "JAVA_HOME", "NODE_ENV"]
```

#### Best Practices

* Best used for inspection or debugging.
* On Windows, avoid repeatedly calling this method; it spawns a `reg` process each time.

---

### 5. `listValues()`

```ts
listValues(): S[keyof S][]
```

Lists all **values** associated with system environment variables.

#### Example

```ts
const values = env.listValues();
console.log(values); // ["C:\\Windows\\System32", "C:\\Program Files\\Java", ...]
```

#### Behavior

* Iterates over keys from `listKeys()`, calling `get()` on each.
* Returns the raw string values as defined by the system.

#### Best Practices

* May be slower than `listKeys()` due to repeated lookups.
* Use sparingly for inspection or export operations.

---

### 6. `saveToFile(path?)`

```ts
async saveToFile(path?: string): Promise<void>
```

Exports all system environment variables into a structured JSON file.

#### Parameters

| Name   | Type     | Description                                                                    |
| ------ | -------- | ------------------------------------------------------------------------------ |
| `path` | `string` | Optional custom output path (default: `./system-environment-<platform>.json`). |

#### Behavior

* Collects all system variables and serializes them as JSON.
* Useful for backups, audits, or synchronization across servers.

#### Example

```ts
await env.saveToFile("./system-env-backup.json");
```

#### Best Practices

* Always run this method before major modifications to the environment.
* Generated files can be safely versioned or shared between systems.

---

## Internal Utility Methods

### `canWriteFile(path)`

Performs a simple permission check to determine if the target file (usually `/etc/environment`) is writable.

| Returns | Type      | Description                               |
| ------- | --------- | ----------------------------------------- |
| `true`  | `boolean` | The file can be modified by the process.  |
| `false` | `boolean` | The file is not writable (requires root). |

---

## Cross-Platform Notes

| Platform        | Mechanism     | Location           | Requires Privilege |
| --------------- | ------------- | ------------------ | ------------------ |
| **Windows**     | Registry keys | `HKLM\Environment` | ✅ Administrator    |
| **macOS/Linux** | File-based    | `/etc/environment` | ✅ Root access      |

### Security Considerations

* This class performs **system-wide changes**; improper use can break global configurations.
* Always ensure you have sufficient privileges before calling write operations.
* Avoid running from untrusted scripts.

### Reliability

* **Windows:** Changes are reflected in new sessions; existing processes retain old variables.
* **Linux/macOS:** Requires re-login or reboot to propagate changes globally.

---

## Example Usage

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

---

## Recommendations

* Use **`SystemEnvironment`** only for global, administrative operations.
* Always create a **JSON backup** using `saveToFile()` before making changes.
* Avoid altering critical variables like `PATH` or `SHELL` without full understanding.
* Prefer `UserEnvironment` when working with per-user configurations.
