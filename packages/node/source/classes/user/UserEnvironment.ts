import { spawnSync } from "node:child_process";
import {
  accessSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { constants } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { basename, join } from "node:path";

import { Platform } from "@/types/global";
import { WindowsRegistry, WindowsRegistryType } from "@/types/registry";

/**
 * A class that provides methods for managing **user-level environment variables**.
 * It abstracts the differences between Windows (HKCU Registry) and Unix-like systems (shell configuration files like `.bashrc`, `.zshrc`).
 *
 * @example
 * ```typescript
 * const userEnv = new UserEnvironment(process.platform);
 *
 * // Set a user-specific variable
 * userEnv.set("MY_APP_THEME", "dark");
 *
 * // Get the variable
 * const theme = userEnv.get("MY_APP_THEME");
 * console.log(`User theme is: ${theme}`);
 *
 * // List all user-specific variables
 * const allUserVars = userEnv.listKeys();
 * console.log(allUserVars);
 * ```
 *
 * @template S - An abstract schema representing the structure of the environment variables.
 * @documentation [view on GitHub](https://github.com/octovel/environment-node/blob/stable/docs/guides/user-environment.md)
 */
class UserEnvironment<
  S extends Record<string, string> = Record<string, string>,
> {
  /** The operating system platform to base operations on. */
  public platform: Platform;

  /**
   * Creates an instance of the UserEnvironment class.
   * @param platform The operating system platform.
   */
  constructor(platform: Platform) {
    this.platform = platform;
  }

  //#region Core Operations
  /**
   * Retrieves the value of a user environment variable.
   *
   * @param name - The name of the environment variable to retrieve.
   * @param options - Optional settings for the operation.
   * @param options.defaultValue - A fallback value to return if the variable is not found.
   * @param options.type - (Windows only) The registry value type to query.
   * @returns The value of the environment variable, or the default value if not found.
   */
  public get<K extends keyof S>(
    name: K,
    options?: {
      defaultValue?: S[K];
      type?: WindowsRegistryType;
    },
  ): S[K] | undefined {
    const varName = String(name);
    switch (this.platform) {
      // Windows
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["query", WindowsRegistry.HKCU, "/v", varName],
          {
            stdio: ["pipe", "pipe", "pipe"],
            encoding: "utf-8",
          },
        );

        if (response.status !== 0) return options?.defaultValue;

        const line = response.stdout
          .split("\n")
          .find((l) => l.includes(varName));

        if (!line) return options?.defaultValue;

        const parts = line.trim().split(/\s{2,}/);
        return (parts[2] as S[K]) ?? options?.defaultValue;
      }

      // MacOS and Linux
      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!existsSync(rcFilePath)) return options?.defaultValue;

        const content = readFileSync(rcFilePath, "utf-8");
        const regex = new RegExp(
          `(?:export|set|setenv)\\s+${varName}(?:=|\\s+)["']?(.+?)["']?$`,
        );
        const match = content.match(regex);

        return match ? (match[1] as S[K]) : options?.defaultValue;
      }

      default:
        return options?.defaultValue;
    }
  }

  /**
   * Sets the value of a user environment variable.
   * On Windows, this modifies the HKCU registry. On Unix, it appends an export command to the appropriate shell config file (e.g., `.bashrc`, `.zshrc`).
   *
   * @param name - The name of the environment variable to set.
   * @param value - The value to assign to the variable.
   * @param options - Optional settings for the operation.
   * @param options.type - (Windows only) The registry value type to create.
   */
  public set<K extends keyof S>(
    name: K,
    value: S[K],
    options?: {
      type?: WindowsRegistryType;
    },
  ): void {
    const varName = String(name);
    const varValue = String(value);

    switch (this.platform) {
      // Windows
      case Platform.Windows: {
        const args = [
          "add",
          WindowsRegistry.HKCU,
          "/v",
          varName,
          "/t",
          `${options?.type || WindowsRegistryType.REG_EXPAND_SZ}`,
          "/d",
          varValue,
          "/f",
        ];

        const response = spawnSync("reg", args, {
          stdio: ["ignore", "pipe", "pipe"],
          shell: false,
          encoding: "utf-8",
        });

        if (response.status !== 0) {
          const stderr: string = response.stderr?.toString() || "";
          console.error(`Failed to set registry key: ${stderr.trim()}`);
        }
        break;
      }

      // Unix (macOS + Linux)
      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!rcFilePath) {
          console.error("Cannot determine RC file path.");
          return;
        }

        let content: string = existsSync(rcFilePath)
          ? readFileSync(rcFilePath, { encoding: "utf-8" })
          : "";

        // Remove existing variable lines to avoid duplicates
        const filteredContent = content
          .split("\n")
          .filter((line) => {
            return !line.match(
              new RegExp(`(?:^|\\s)(export|set|setenv)\\s+${varName}(=|\\s)`),
            );
          })
          .join("\n");

        const exportLine = this.getExportLine(name, value);

        if (!this.canWriteFile(rcFilePath)) {
          console.error(`Cannot write to ${rcFilePath}. Check permissions.`);
          return;
        }

        writeFileSync(rcFilePath, filteredContent + "\n" + exportLine, {
          encoding: "utf-8",
        });
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Removes a user environment variable.
   *
   * @param name The name of the environment variable to remove.
   */
  public remove<K extends keyof S>(name: K): void {
    const varName = String(name);
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["delete", WindowsRegistry.HKCU, "/v", varName, "/f"],
          {
            stdio: ["ignore", "pipe", "pipe"],
            encoding: "utf-8",
          },
        );

        if (response.status !== 0) {
          const stderr = response.stderr?.toString() || "";
          console.error(`Failed to remove registry key: ${stderr.trim()}`);
        }
        break;
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!existsSync(rcFilePath)) return;

        const content = readFileSync(rcFilePath, "utf-8");
        const filteredContent = content
          .split("\n")
          .filter((line) => {
            return !line.match(
              new RegExp(`(?:^|\\s)(export|set|setenv)\\s+${varName}(=|\\s)`),
            );
          })
          .join("\n");

        if (!this.canWriteFile(rcFilePath)) {
          console.error(`Cannot write to ${rcFilePath}`);
          return;
        }

        writeFileSync(rcFilePath, filteredContent, {
          encoding: "utf-8",
        });
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Lists all user-level environment variable keys.
   *
   * @returns An array of keys for the user environment variables.
   */
  public listKeys(): (keyof S)[] {
    switch (this.platform) {
      case Platform.Windows: {
        // Query the HKCU\Environment keys
        const response = spawnSync("reg", ["query", WindowsRegistry.HKCU], {
          stdio: ["pipe", "pipe", "pipe"],
          encoding: "utf-8",
        });

        if (response.status !== 0) return [];

        // Parse registry output: each line that looks like "Name    Type    Value"
        const keys: string[] = [];
        response.stdout.split("\n").forEach((line) => {
          const match = line.trim().match(/^([^\s]+)\s+(REG_\w+)\s+(.*)$/);
          if (match) keys.push(match[1]);
        });

        return keys as (keyof S)[];
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!existsSync(rcFilePath)) return [];

        const content = readFileSync(rcFilePath, { encoding: "utf-8" });
        const keys: string[] = [];

        content.split("\n").forEach((line) => {
          const match = line.match(
            /(?:export|set|setenv)\s+([A-Za-z_][A-Za-z0-9_]*)/,
          );
          if (match) keys.push(match[1]);
        });

        return keys as (keyof S)[];
      }

      default:
        return [];
    }
  }

  /**
   * Lists all user-level environment variable values.
   *
   * @returns An array of values for the user environment variables.
   */
  public listValues(): S[keyof S][] {
    const keys = this.listKeys();
    const values: S[keyof S][] = [];

    switch (this.platform) {
      case Platform.Windows: {
        keys.forEach((key) => {
          const response = spawnSync(
            "reg",
            ["query", WindowsRegistry.HKCU, "/v", key as string],
            {
              stdio: ["pipe", "pipe", "pipe"],
              encoding: "utf-8",
            },
          );

          if (response.status === 0) {
            const match = response.stdout
              .split("\n")
              .find((line) => line.includes(key as string));
            if (match) {
              const parts = match.trim().split(/\s{2,}/);
              values.push(parts[2] as S[keyof S]);
            }
          }
        });
        break;
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!existsSync(rcFilePath)) return [];

        const content = readFileSync(rcFilePath, { encoding: "utf-8" });
        content.split("\n").forEach((line) => {
          const match = line.match(
            /(?:export|set|setenv)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?(.+?)"?$/,
          );
          if (match) {
            values.push(match[2] as S[keyof S]);
          }
        });
        break;
      }
    }

    return values;
  }

  //#endregion Core Operations

  //#region File Operations
  /**
   * Exports all user environment variables to a file.
   *
   * This can be useful for creating backups or sharing configurations.
   * The output file will be in JSON format.
   *
   * @param path The absolute or relative path to save the file to.
   * If not provided, it defaults to `./user-environment-[platform].json`.
   */
  public async saveToFile(path?: string): Promise<void> {
    const fs = await import("fs/promises");

    let envData: Record<string, string> = {};

    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync("reg", ["query", WindowsRegistry.HKCU], {
          stdio: ["pipe", "pipe", "pipe"],
          encoding: "utf-8",
        });

        if (response.status !== 0) {
          console.error("Failed to read registry for saving.");
          return;
        }

        response.stdout.split("\n").forEach((line) => {
          const match = line.trim().match(/^([^\s]+)\s+(REG_\w+)\s+(.*)$/);
          if (match) envData[match[1]] = match[3];
        });
        break;
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const rcFilePath = this.getRCFilePath();
        if (!existsSync(rcFilePath)) break;

        const content = readFileSync(rcFilePath, "utf-8");
        content.split("\n").forEach((line) => {
          const match = line.match(
            /(?:export|set|setenv)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|\s+)?["']?(.+?)?["']?$/,
          );
          if (match) envData[match[1]] = match[2] || "";
        });
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }

    if (!path) path = `./user-environment-${this.platform}.json`;
    await fs.writeFile(path, JSON.stringify(envData, null, 2), "utf-8");
  }

  //#endregion File Operations

  //#region Internal Methods
  /**
   * Infers the user's shell configuration file path (e.g., `~/.bashrc`, `~/.zshrc`).
   * Creates the file if it does not exist.
   *
   * @internal This method is used internally and is not intended for external use.
   * @returns The absolute path to the RC file, or an empty string if it cannot be determined or created.
   */
  private getRCFilePath(): string {
    const homeDir = homedir();
    const shell = basename(process.env.SHELL || "/bin/sh");

    const isMac = platform() === Platform.MacOS;
    let rcFilePath: string;

    // Define the default file path based on the shell
    if (shell.includes("zsh")) {
      rcFilePath = join(homeDir, ".zshrc");
    } else if (shell.includes("bash")) {
      rcFilePath = isMac
        ? join(homeDir, ".bash_profile")
        : join(homeDir, ".bashrc");
    } else if (shell.includes("fish")) {
      const fishDirPath = join(homeDir, ".config", "fish");
      mkdirSync(fishDirPath, { recursive: true });
      rcFilePath = join(fishDirPath, "config.fish");
    } else if (shell.includes("tcsh")) {
      rcFilePath = join(homeDir, ".tcshrc");
    } else {
      rcFilePath = join(homeDir, ".profile");
    }

    // Check if the file exists and is writable
    if (!existsSync(rcFilePath)) {
      if (!this.canWriteFile(rcFilePath)) {
        console.error(`Cannot write to ${rcFilePath}. Check permissions.`);
        return "";
      }
      writeFileSync(rcFilePath, "");
    }

    return rcFilePath;
  }

  /**
   * Checks whether the current process has write permissions for a file.
   *
   * @internal This method is used internally and is not intended for external use.
   * @param path The path to the file to check.
   * @returns `true` if the file is writable, `false` otherwise.
   */
  private canWriteFile(path: string): boolean {
    try {
      accessSync(path, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates the correct shell command to export a variable based on the user's current shell.
   *
   * @internal This method is used internally and is not intended for external use.
   * @param variable The name of the variable to export.
   * @param value The value of the variable.
   * @returns A string containing the shell command (e.g., `export VAR="value"`).
   */
  private getExportLine<K extends keyof S>(variable: K, value: S[K]): string {
    let shell: string = basename(process.env.SHELL || "/bin/sh");
    let safeValue: string = value.replace(/"/g, '\\"');

    if (shell.includes("fish")) {
      return `\nset -gx ${variable as string} "${safeValue}"\n`;
    } else if (shell.includes("tcsh")) {
      return `\nsetenv ${variable as string} "${safeValue}"\n`;
    } else {
      // bash, zsh, and other POSIX shells (works on Linux + macOS)
      return `\nexport ${variable as string}="${safeValue}"\n`;
    }
  }
}

export { UserEnvironment };
