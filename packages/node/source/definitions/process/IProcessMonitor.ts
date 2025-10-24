import type { ChildProcess } from "node:child_process";

/**
 * This interface represents the structure and implementation of the `ProcessMonitor` class.
 *
 * @template P - The type of the Node.js ChildProcess instance.
 *
 * @internal This interface is used internally and is not intended for external use.
 */
interface IProcessMonitor<P extends ChildProcess> {
  //#region Core Operations
  // TODO: getUsage(process: P): IProcessMonitorUsage;
  isAlive(process: P): boolean;
  getUptime(process: P, startTime: number): number;
  //#endregion Core Operations
}

export { IProcessMonitor };
