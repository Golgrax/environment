import type { ChildProcess } from "node:child_process";

import type { IProcessInfo } from "@/types/process";

/**
 * A class that provides methods for managing records of active processes.
 *
 * @template P - The specific type of child process being managed.
 * @documentation [view on GitHub](https://github.com/octovel/environment/blob/stable/docs/guides/process-registry.md)
 */
export class ProcessRegistry<P extends ChildProcess = ChildProcess> {
  /**
   * Maps process IDs (`pid`) to their corresponding metadata and instance.
   *
   * @internal This property is used internally to store and manage process information.
   */
  private readonly registry = new Map<number, IProcessInfo & { instance: P }>();

  //#region Core Operations
  /**
   * Registers a process and its associated metadata into the private `registry` property.
   * Cannot add duplicate entries with the same Process ID.
   *
   * @param info - Metadata describing the process (name, args, timestamps, etc.).
   * @param instance - The Node.js {@link ChildProcess} instance.
   */
  public add(info: IProcessInfo, instance: P): void {
    if (this.registry.has(info.pid)) {
      throw new Error(`Process with PID ${info.pid} is already registered.`);
    }
    this.registry.set(info.pid, { ...info, instance });
  }

  /**
   * Removes a process from the registry by its PID.
   *
   * @param pid - The ID of the process to remove.
   * @returns `true` if the process was removed successfully, `false` otherwise.
   */
  public remove(pid: number): boolean {
    return this.registry.delete(pid);
  }

  /**
   * Retrieves process details by PID.
   *
   * @param pid - The process ID to retrieve.
   * @returns The associated process info and instance, or `undefined` if not found.
   */
  public get(
    pid: number,
  ): Readonly<IProcessInfo & { instance: P }> | undefined {
    const record = this.registry.get(pid);
    return record ? Object.freeze(record) : undefined;
  }

  /**
   * Returns all registered processes as an array of readonly objects.
   *
   * @returns A readonly array of process records.
   */
  public list(): readonly Readonly<IProcessInfo & { instance: P }>[] {
    return Array.from(this.registry.values()) as Readonly<
      IProcessInfo & { instance: P }
    >[];
  }

  /**
   * Checks whether a process with the given PID exists in the registry.
   *
   * @param pid - The process ID to check.
   * @returns `true` if the process exists, `false` otherwise.
   */
  public exists(pid: number): boolean {
    return this.registry.has(pid);
  }
  //#endregion

  //#region Utilities
  /**
   * Clears all entries in the process registry.
   *
   * @returns The number of processes removed.
   */
  public clear(): number {
    const count = this.registry.size;
    this.registry.clear();
    return count;
  }

  /**
   * Returns the total number of processes currently registered.
   *
   * @returns The total number of processes registered.
   */
  public count(): number {
    return this.registry.size;
  }
  //#endregion
}
