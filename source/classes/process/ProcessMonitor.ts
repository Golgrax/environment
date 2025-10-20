import type { ChildProcess } from "node:child_process";

import type { IProcessMonitor } from "@/definitions/process/IProcessMonitor";

/**
 * A class that provides methods for monitoring active processes.
 *
 * @template P - Type of the process instance.
 * @documentation [view on GitHub](https://github.com/octovel/environment-node/blob/stable/docs/guides/process-monitor.md)
 */
class ProcessMonitor<P extends ChildProcess> implements IProcessMonitor<P> {
  /**
   * Checks if the process is alive.
   *
   * @param process - The process instance to monitor.
   * @returns True if the process is alive, false otherwise.
   */
  public isAlive(process: P): boolean {
    if (!process || typeof process.pid !== "number") return false;
    try {
      // Sending signal 0 doesn’t kill the process but checks if it exists.
      process.kill(0);
      return true;
    } catch (error: any) {
      // ESRCH: process does not exist
      // EPERM: no permission (but process exists)
      return error.code === "EPERM";
    }
  }

  /**
   * Returns the uptime of the monitored process in milliseconds.
   *
   * @param process - The process instance to monitor.
   * @param startTime - The start time of the process in milliseconds.
   * @returns Time in milliseconds since monitoring started.
   */
  public getUptime(process: P, startTime: number): number {
    if (!this.isAlive(process)) return 0;
    return Date.now() - startTime;
  }
}

export { ProcessMonitor };
