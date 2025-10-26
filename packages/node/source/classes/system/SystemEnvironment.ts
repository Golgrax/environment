import { spawnSync } from "node:child_process";
import { accessSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { constants } from "node:fs/promises";

import { Platform } from "@/types/global";
import { WindowsRegistry, WindowsRegistryType } from "@/types/registry";

/**
 * A class that provides methods for managing **system-level environment variables**.
 * Supports both Windows (HKLM) and Unix-based systems (`/etc/environment`).
 *
 * Requires elevated (admin/root) permissions for write operations.
 *
 * @template S - The abstract environment schema.
 * @documentation [view on GitHub](https://github.com/octovel/environment-node/blob/stable/docs/guides/system-environment.md)
 */
class SystemEnvironment<
  S extends Record<string, string> = Record<string, string>,
> {
  /** The platform to base operations on. */
  public platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  //#region Core Operations
  /**
   * Retrieves the value of a system environment variable.
   *
   * @param name - The name of the environment variable to retrieve.
   * @param options - Optional options for the operation.
   * @returns The value of the environment variable, or the default value if not found.
   */
  public get<K extends keyof S>(
    name: K,
    options?: { defaultValue?: S[K]; type?: WindowsRegistryType },
  ): S[K] | undefined {
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["query", WindowsRegistry.HKLM, "/v", name as string],
          { stdio: ["pipe", "pipe", "pipe"], encoding: "utf-8" },
        );

        if (response.status !== 0) return options?.defaultValue;

        const line = response.stdout
          .split("\n")
          .find((l) => l.includes(name as string));

        if (!line) return options?.defaultValue;

        const parts = line.trim().split(/\s{2,}/);
        return (parts[2] as S[K]) ?? options?.defaultValue;
      }

      case Platform.MacOS:
      case Platform.Linux: {
        const envFile = "/etc/environment";
        if (!existsSync(envFile)) return options?.defaultValue;

        const content = readFileSync(envFile, "utf-8");
        const regex = new RegExp(`^${name as string}=["']?(.+?)["']?$`, "m");
        const match = content.match(regex);

        return match ? (match[1] as S[K]) : options?.defaultValue;
      }

      default:
        return options?.defaultValue;
    }
  }

  /**
   * Sets a system environment variable.
   *
   * @param name - The name of the environment variable to set.
   * @param value - The value to set for the environment variable.
   * @param options - Optional options for the operation.
   */
  public set<K extends keyof S>(
    name: K,
    value: S[K],
    options?: { type?: WindowsRegistryType },
  ): void {
    switch (this.platform) {
      case Platform.Windows: {
        const args = [
          "add",
          WindowsRegistry.HKLM,
          "/v",
          `${name as string}`,
          "/t",
          `${options?.type || WindowsRegistryType.REG_EXPAND_SZ}`,
          "/d",
          `${value as string}`,
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

        const varName = name as string;
        const regex = new RegExp(`^${varName}=.*$`, "m");

        if (regex.test(content)) {
          content = content.replace(
            regex,
            `${varName}="${(value as string).replace(/"/g, '\\"')}"`,
          );
        } else {
          content += `\n${varName}="${(value as string).replace(/"/g, '\\"')}"`;
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
   * Removes a system environment variable.
   *
   * @param name The name of the environment variable to remove.
   */
  public remove<K extends keyof S>(name: K): void {
    switch (this.platform) {
      case Platform.Windows: {
        const response = spawnSync(
          "reg",
          ["delete", WindowsRegistry.HKLM, "/v", name as string, "/f"],
          { stdio: ["ignore", "pipe", "pipe"], encoding: "utf-8" },
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
          .filter((line) => !line.startsWith(`${name as string}=`))
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
   * @returns An array of keys representing the system environment variables.
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
   * @returns An array of values representing the system environment variables.
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
   * Exports all system environment variables to a file (e.g. JSON backup).
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
   * Checks whether the file exists and is writable.
   *
   * @internal This method is used internally by this class, it is not intended for external use.
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
