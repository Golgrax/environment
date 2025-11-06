import { spawnSync } from "node:child_process";
import { accessSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { constants } from "node:fs/promises";
import { cpus, freemem, platform, totalmem } from "node:os";
import { Platform } from "@/types/global";
import { WindowsRegistry, WindowsRegistryType } from "@/types/registry";

/**
 * A class that provides methods for managing **system-level environment variables**.
 * Supports both Windows (HKLM) and Unix-based systems (`/etc/environment`).
 *
 * Requires elevated (admin/root) permissions for write operations.
 *
 * @template S - The abstract environment schema.
 * @documentation [view on GitHub](https://github.com/octovel/environment/blob/stable/docs/guides/system-environment.md)
 */
class SystemEnvironment<
  S extends Record<string, string> = Record<string, string>,
> {
  /** The platform to base operations on. */
  public platform: Platform;

  /**
   * Creates an instance of the SystemEnvironment class.
   * @param platform The operating system platform to use.
   */
  constructor(platform: Platform) {
    this.platform = platform;
  }

  //#region Core Operations
  /**
   * Retrieves the value of a system environment variable.
   *
   * @param name - The name of the environment variable to retrieve.
   * @param options - Optional settings for the operation.
   * @param options.defaultValue - A fallback value to return if the variable is not found.
   * @param options.type - (Windows only) The registry value type to query.
   * @returns The value of the environment variable, or the default value if not found.
   */
  public get<K extends keyof S>(
    name: K,
    options?: { defaultValue?: S[K]; type?: WindowsRegistryType },
  ): S[K] | undefined {
    const varName = String(name);
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["query", WindowsRegistry.HKLM, "/v", varName],
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

      case Platform.MacOS:
      case Platform.Linux: {
        const envFile = "/etc/environment";
        if (!existsSync(envFile)) return options?.defaultValue;

        const content = readFileSync(envFile, "utf-8");
        const regex = new RegExp(`^${varName}=["']?(.+?)["']?$`, "m");
        const match = content.match(regex);

        return match ? (match[1] as S[K]) : options?.defaultValue;
      }

      default:
        return options?.defaultValue;
    }
  }

  /**
   * Gets the operating system platform (e.g., 'win32', 'linux').
   * @returns The operating system platform.
   */
  public getOS(): string {
    return platform();
  }

  /**
   * Gets information about the system's CPU.
   * @returns An object containing the CPU model and speed, or default values if not available.
   */
  public getCPU(): { model: string; speed: number } {
    const cpusList = cpus();
    if (cpusList.length > 0) {
      return { model: cpusList[0].model, speed: cpusList[0].speed };
    }
    return { model: "unknown", speed: 0 };
  }

  /**
   * Gets information about the system's memory.
   *
   * @returns An object containing the total and free system memory in bytes.
   */
  public getMemory(): { total: number; free: number } {
    return { total: totalmem(), free: freemem() };
  }

  /**
   * Sets a system environment variable. **Requires admin/root privileges.**
   *
   * @param name - The name of the environment variable to set.
   * @param value - The value to set for the environment variable.
   * @param options - Optional settings for the operation.
   * @param options.type - (Windows only) The registry value type to create.
   */
  public set<K extends keyof S>(
    name: K,
    value: S[K],
    options?: { type?: WindowsRegistryType },
  ): void {
    const varName = String(name);
    const varValue = String(value);

    switch (this.platform) {
      case Platform.Windows: {
        const args = [
          "add",
          WindowsRegistry.HKLM,
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
          const stderr = response.stderr?.toString() || "";
          console.error(`Failed to set system registry key: ${stderr.trim()}`);
        }
        break;
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const envFile = "/etc/environment";
        let content = existsSync(envFile) ? readFileSync(envFile, "utf-8") : "";

        const regex = new RegExp(`^${varName}=.*$`, "m");

        if (regex.test(content)) {
          content = content.replace(
            regex,
            `${varName}="${varValue.replace(/"/g, '\\"')}"`,
          );
        } else {
          content += `\n${varName}="${varValue.replace(/"/g, '\\"')}"`;
        }

        if (!this.canWriteFile(envFile)) {
          console.error(
            "Permission denied: requires sudo/root to modify /etc/environment",
          );
          return;
        }

        writeFileSync(envFile, content.trim() + "\n", "utf-8");
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Removes a system environment variable. **Requires admin/root privileges.**
   *
   * @param name The name of the environment variable to remove.
   */
  public remove<K extends keyof S>(name: K): void {
    const varName = String(name);
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["delete", WindowsRegistry.HKLM, "/v", varName, "/f"],
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
        const envFile = "/etc/environment";
        if (!existsSync(envFile)) return;

        const content = readFileSync(envFile, "utf-8");
        const filtered = content
          .split("\n")
          .filter((line) => !line.startsWith(`${varName}=`))
          .join("\n");

        if (!this.canWriteFile(envFile)) {
          console.error("Permission denied: requires sudo/root");
          return;
        }

        writeFileSync(envFile, filtered.trim() + "\n", "utf-8");
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  /**
   * Lists all system environment variable keys.
   *
   * @returns An array of keys for the system environment variables.
   */
  public listKeys(): (keyof S)[] {
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync("reg", ["query", WindowsRegistry.HKLM], {
          stdio: ["pipe", "pipe", "pipe"],
          encoding: "utf-8",
        });
        if (response.status !== 0) return [];

        const keys: string[] = [];
        response.stdout.split("\n").forEach((line) => {
          const match = line.trim().match(/^([^\s]+)\s+(REG_\w+)\s+(.*)$/);
          if (match) keys.push(match[1]);
        });

        return keys as (keyof S)[];
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const envFile = "/etc/environment";
        if (!existsSync(envFile)) return [];

        const keys = readFileSync(envFile, "utf-8")
          .split("\n")
          .map((line) => line.split("=")[0].trim())
          .filter((key) => key.length > 0);

        return keys as (keyof S)[];
      }

      default:
        return [];
    }
  }

  /**
   * Lists all system environment variable values.
   *
   * @returns An array of values for the system environment variables.
   */
  public listValues(): S[keyof S][] {
    const keys = this.listKeys();
    const values: S[keyof S][] = [];

    keys.forEach((key) => {
      const value = this.get(key);
      if (value) values.push(value);
    });

    return values;
  }

  //#endregion

  //#region File Operations
  /**
   * Exports all system environment variables to a file.
   *
   * This can be useful for creating backups or sharing configurations.
   * The output file will be in JSON format.
   *
   * @param path The absolute or relative path to save the file to.
   * If not provided, it defaults to `./system-environment-[platform].json`.
   */
  public async saveToFile(path?: string): Promise<void> {
    const fs = await import("fs/promises");
    const data: Record<string, string> = {};

    for (const key of this.listKeys()) {
      const val = this.get(key);
      if (val) data[key as string] = val;
    }

    await fs.writeFile(
      path || `./system-environment-${this.platform}.json`,
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }
  //#endregion

  //#region Internal Methods
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
  //#endregion
}

export { SystemEnvironment };
