# API Specification

This document defines the API for the Environment project. All language implementations must adhere to this specification.

## SystemEnvironment

Provides access to system-level information and environment variables.

### `SystemEnvironment(platform: Platform)`

-   **Description:** Creates a new instance of the SystemEnvironment class.
-   **Parameters:**
    -   `platform` (`Platform`): The platform to base operations on.
-   **Returns:** `SystemEnvironment`

### `get<K extends keyof S>(name: K, options?: { defaultValue?: S[K]; type?: WindowsRegistryType })`

-   **Description:** Retrieves the value of a system environment variable.
-   **Parameters:**
    -   `name` (`K`): The name of the environment variable to retrieve.
    -   `options` (`object`, optional): Optional options for the operation.
        -   `defaultValue` (`S[K]`, optional): The default value to return if the variable is not found.
        -   `type` (`WindowsRegistryType`, optional): The type of the Windows Registry key (only applicable for Windows).
-   **Returns:** `S[K] | undefined`

### `set<K extends keyof S>(name: K, value: S[K], options?: { type?: WindowsRegistryType })`

-   **Description:** Sets a system environment variable.
-   **Parameters:**
    -   `name` (`K`): The name of the environment variable to set.
    -   `value` (`S[K]`): The value to set for the environment variable.
    -   `options` (`object`, optional): Optional options for the operation.
        -   `type` (`WindowsRegistryType`, optional): The type of the Windows Registry key (only applicable for Windows).
-   **Returns:** `void`

### `remove<K extends keyof S>(name: K)`

-   **Description:** Removes a system environment variable.
-   **Parameters:**
    -   `name` (`K`): The name of the environment variable to remove.
-   **Returns:** `void`

### `listKeys(): (keyof S)[]`

-   **Description:** Lists all system environment variable keys.
-   **Parameters:** None
-   **Returns:** `(keyof S)[]`

### `listValues(): S[keyof S][]`

-   **Description:** Lists all system environment variable values.
-   **Parameters:** None
-   **Returns:** `S[keyof S][]`

### `getOS()`

-   **Description:** Returns the operating system.
-   **Parameters:** None
-   **Returns:** `string`

### `getCPU()`

-   **Description:** Returns the CPU information.
-   **Parameters:** None
-   **Returns:** `object`

### `getMemory()`

-   **Description:** Returns the memory information.
-   **Parameters:** None
-   **Returns:** `object`

## UserEnvironment

Provides access to user-level environment variables.

### `UserEnvironment()`

-   **Description:** Creates a new instance of the UserEnvironment class.
-   **Returns:** `UserEnvironment`

### `get(name: string, defaultValue?: string)`

-   **Description:** Retrieves the value of a user environment variable.
-   **Parameters:**
    -   `name` (`string`): The name of the environment variable to retrieve.
    -   `defaultValue` (`string`, optional): The default value to return if the variable is not found.
-   **Returns:** `string | undefined`

### `set(name: string, value: string)`

-   **Description:** Sets a user environment variable.
-   **Parameters:**
    -   `name` (`string`): The name of the environment variable to set.
    -   `value` (`string`): The value to set for the environment variable.
-   **Returns:** `void`

### `remove(name: string)`

-   **Description:** Removes a user environment variable.
-   **Parameters:**
    -   `name` (`string`): The name of the environment variable to remove.
-   **Returns:** `void`

### `listKeys(): string[]`

-   **Description:** Lists all user environment variable keys.
-   **Parameters:** None
-   **Returns:** `string[]`

### `listValues(): string[]`

-   **Description:** Lists all user environment variable values.
-   **Parameters:** None
-   **Returns:** `string[]`

## Process

Provides access to process-level information.

### `getProcessId()`

-   **Description:** Returns the process ID.
-   **Parameters:** None
-   **Returns:** `number`

### `getCommandLineArguments()`

-   **Description:** Returns the command-line arguments.
-   **Parameters:** None
-   **Returns:** `string[]`

### `getMemoryUsage()`

-   **Description:** Returns the memory usage of the process.
-   **Parameters:** None
-   **Returns:** `object`

