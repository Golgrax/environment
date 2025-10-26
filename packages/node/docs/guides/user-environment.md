## Overview

The `UserEnvironment` class provides a unified interface for reading, writing, and managing user environment variables across major desktop platforms.

It supports:

* Windows registry operations under `HKCU\Environment`
* UNIX-style shell configuration management (`.bashrc`, `.zshrc`, `.profile`, etc.)
* Safe file operations for persisting variables to disk

This class can be used to manage custom runtime variables, modify system paths, or synchronize environment configurations across systems.

**Source:** [`source/classes/user/UserEnvironment.ts`](https://github.com/octovel/environment-node/blob/stable/source/classes/user/UserEnvironment.ts)

---

## Constructor

```ts
new UserEnvironment<S extends Record<string, string>>(platform: Platform)
```

Creates a new `UserEnvironment` instance, initialized for a specific operating system.

### Parameters

| Name       | Type                                | Description                                            |
| ---------- | ----------------------------------- | ------------------------------------------------------ |
| `platform` | [`Platform`](https://github.com/octovel/environment-node/blob/stable/source/types/global.ts) | The current platform. Should match `process.platform`. |

### Example

```ts
import { UserEnvironment, Platform } from "@octovel/environment";

const env = new UserEnvironment(Platform.Windows);
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

Retrieves the value of a user environment variable.

* On **Windows**, reads from `HKCU\Environment` via the `reg query` command.
* On **macOS/Linux**, parses the user’s RC file (e.g. `.bashrc`, `.zshrc`, `.profile`) and looks for a matching `export`, `set`, or `setenv` statement.

#### Parameters

| Name                   | Type                  | Description                                   |
| ---------------------- | --------------------- | --------------------------------------------- |
| `name`                 | `keyof S`             | Name of the environment variable to retrieve. |
| `options.defaultValue` | `S[K]`                | Fallback value if the variable is not found.  |
| `options.type`         | `WindowsRegistryType` | Registry value type (only for Windows).       |

#### Returns

The value of the environment variable, or `options.defaultValue` if not found.

#### Example

```ts
const env = new UserEnvironment(Platform.Windows);
const path = env.get("PATH", { defaultValue: "C:\\Windows\\System32" });
```

#### Best Practices

* Always provide a `defaultValue` to handle missing or corrupted variables.
* Avoid calling `get()` in tight loops, as it may invoke system commands.

---

### 2. `set(name, value, options?)`

```ts
set<K extends keyof S>(
  name: K,
  value: S[K],
  options?: { type?: WindowsRegistryType }
): void
```

Sets or updates a user environment variable.

* On **Windows**, uses `reg add` to create or modify a value under `HKCU\Environment`.
* On **macOS/Linux**, writes or replaces the corresponding line in the user’s RC file.

#### Parameters

| Name           | Type                  | Description                                      |
| -------------- | --------------------- | ------------------------------------------------ |
| `name`         | `keyof S`             | Environment variable name.                       |
| `value`        | `S[K]`                | Value to assign to the variable.                 |
| `options.type` | `WindowsRegistryType` | Type of registry key (default: `REG_EXPAND_SZ`). |

#### Behavior

* On UNIX systems, the variable line is automatically replaced if it already exists.
* The method ensures file writability and logs an error if permission issues occur.

#### Example

```ts
env.set("TEST_PATH", "%ProgramFiles%\\Test", { type: WindowsRegistryType.REG_EXPAND_SZ });
```

#### Best Practices

* Use `REG_EXPAND_SZ` for paths containing Windows environment references like `%ProgramFiles%`.
* When writing to shell files, ensure you reload your shell or source the RC file for the change to take effect.

---

### 3. `remove(name)`

```ts
remove<K extends keyof S>(name: K): void
```

Removes a variable from the user environment.

#### Behavior

* On **Windows**, executes `reg delete HKCU\Environment /v <name> /f`.
* On **UNIX systems**, removes the matching line from the RC file.

#### Parameters

| Name   | Type      | Description                     |
| ------ | --------- | ------------------------------- |
| `name` | `keyof S` | Name of the variable to remove. |

#### Example

```ts
env.remove("TEST_PATH");
```

#### Best Practices

* Use this method carefully; it **permanently deletes** the variable.
* Always back up critical variables before removing entries.

---

### 4. `listKeys()`

```ts
listKeys(): (keyof S)[]
```

Lists all available environment variable names for the current user.

#### Behavior

* On **Windows**, parses `reg query HKCU\Environment` output.
* On **UNIX systems**, scans the RC file for `export`, `set`, or `setenv` statements.

#### Example

```ts
const keys = env.listKeys();
console.log(keys); // [ "PATH", "NODE_ENV", "JAVA_HOME", ... ]
```

#### Best Practices

* For large environments, prefer calling `listKeys()` once and caching results.
* On Windows, this operation spawns a system process; avoid overuse in performance-sensitive code.

---

### 5. `listValues()`

```ts
listValues(): S[keyof S][]
```

Lists all current environment variable **values**.

#### Behavior

Uses the same data sources as `listKeys()` but extracts the values instead of keys.

#### Example

```ts
const values = env.listValues();
console.log(values); // [ "C:\\Windows\\System32", "production", ... ]
```

#### Best Practices

* Useful for quick inspection or when saving the environment to external storage.
* Returned order corresponds to `listKeys()` order.

---

### 6. `saveToFile(path?)`

```ts
async saveToFile(path?: string): Promise<void>
```

Saves all current environment variables to a JSON file.

#### Parameters

| Name   | Type                | Description                                                  |
| ------ | ------------------- | ------------------------------------------------------------ |
| `path` | `string` (optional) | Output path (default: `./user-environment-<platform>.json`). |

#### Behavior

* On **Windows**, executes `reg query HKCU\Environment` and serializes the output.
* On **UNIX systems**, parses the RC file and writes a clean key-value map.

#### Example

```ts
await env.saveToFile("./backup.json");
```

#### Best Practices

* Use this method to back up user environment configurations before performing bulk operations.
* The generated JSON can be imported or version-controlled for reproducibility.

---

## Internal Utility Methods

These methods are internal helpers used by the class and are not part of the public API. They are documented here for completeness.

### `getRCFilePath()`

Determines the appropriate RC file for the current user shell.
For example:

* `.zshrc` for Zsh
* `.bashrc` or `.bash_profile` for Bash
* `.config/fish/config.fish` for Fish
* `.profile` as a fallback

Creates the file if it does not exist and verifies writability.

---

### `canWriteFile(path)`

Performs a basic permission check using `fs.accessSync()` and `fs.constants.W_OK`.
Returns `true` if the file can be written to, otherwise `false`.

---

### `getExportLine(variable, value)`

Generates a properly formatted export line for the current shell syntax.

Examples:

* Bash/Zsh: `export VAR="value"`
* Fish: `set -gx VAR "value"`
* Tcsh: `setenv VAR "value"`

Escapes double quotes for safety.

---

## Cross-Platform Notes

| Platform        | Mechanism      | Location                                    |
| --------------- | -------------- | ------------------------------------------- |
| **Windows**     | Registry keys  | `HKCU\Environment`                          |
| **macOS/Linux** | Shell RC files | `~/.bashrc`, `~/.zshrc`, `~/.profile`, etc. |

### Security Considerations

* The class **does not require elevated privileges**; all operations occur in user scope.
* On Windows, registry operations are executed under `HKCU` (current user), not `HKLM`.
* Always ensure file permissions are respected when modifying RC files on shared systems.

### Reliability

* Modifying shell RC files will not affect the current session immediately.
  You must re-source the file (e.g. `source ~/.bashrc`) or restart the terminal.
* Registry changes take effect for new processes; existing processes may not see updates until restarted.

---

## Example Usage

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

---

## Recommendations

* Prefer using **`UserEnvironment`** for tooling or setup scripts, not for per-request runtime logic.
* Always **back up** (`saveToFile`) before modifying user environment configurations.
* Avoid writing to shell files on headless or minimal systems where no interactive shell is used.
* On Windows, test your operations in a sandboxed environment before deploying to production systems.
