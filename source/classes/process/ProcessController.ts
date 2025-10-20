import {
  spawn,
  type ChildProcess,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";

import type { IProcessControllerOptions } from "@/types/process";
import type { IProcessController } from "@/definitions/process/IProcessController";

/**
 * A type-safe and flexible process controller.
 *
 * Provides features such as:
 * - Process spawning with customizable options
 * - Graceful stopping and restarting of processes
 * - Runtime status checks for process health
 *
 * @template P - Type of the process instance (default: ChildProcess).
 * @template O - Type of the options object (default: ProcessOptions).
 */
class ProcessController<P extends ChildProcess>
  implements IProcessController<P>
{
  //#region Process Management
  /**
   * Starts a new child process with the given command and arguments.
   *
   * Internally uses Node's {@link spawn} function. The process inherits the parent
   * `stdio` by default, allowing the output to be displayed directly in the console.
   *
   * @param command - The executable command to run (e.g., `"node"` or `"npm"`).
   * @param args - A readonly array of string arguments to pass to the command.
   * @param options - Optional {@link ProcessOptions} controlling spawn behavior.
   * @returns The newly created {@link ChildProcess} instance.
   */
  public start(
    command: string,
    args: Readonly<Array<string>>,
    options?: IProcessControllerOptions,
  ): ChildProcessWithoutNullStreams {
    try {
      return spawn(command, args, {
        cwd: options?.cwd,
        env: options?.env,
        detached: options?.detached,
        stdio: "pipe",
      });
    } catch (error) {
      console.error(`Failed to start process: ${error}`);
      throw error;
    }
  }

  /**
   * Attempts to stop a running process gracefully by sending it a termination signal.
   *
   * If no signal is specified, `"SIGTERM"` is used by default.
   * Returns `true` if the signal was successfully sent, or `false` if it failed.
   *
   * @param process - The {@link ChildProcess} instance to terminate.
   * @param signal - The termination signal to send (default: `"SIGTERM"`).
   * @returns Whether the termination signal was successfully delivered.
   */
  public stop(process: P, signal: NodeJS.Signals = "SIGTERM"): boolean {
    try {
      process.kill(signal);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Restarts an existing process by first stopping it and then creating a new one.
   *
   * This is a **synchronous** implementation. If your restart logic involves cleanup
   * or asynchronous operations, consider overriding this method or extending
   * {@link ProcessController} to return a `Promise<boolean>` instead.
   *
   * @param process - The currently running process to restart.
   * @param command - The executable command for the new process.
   * @param args - Command-line arguments for the new process.
   * @param options - Optional spawn configuration.
   * @returns `true` if the process was restarted successfully.
   */
  public restart(
    process: P,
    command: string,
    args: Readonly<Array<string>>,
    options?: IProcessControllerOptions,
  ): ChildProcessWithoutNullStreams {
    this.stop(process, "SIGTERM");
    return this.start(command, args, options);
  }

  /**
   * Checks whether a given process is currently alive.
   *
   * Uses the `kill(pid, 0)` trick, which doesn’t terminate the process but
   * throws an error if it doesn’t exist. This makes it a **safe and cross-platform**
   * way to determine process liveness.
   *
   * @param process - The {@link ChildProcess} instance to inspect.
   * @returns `true` if the process is alive, `false` otherwise.
   */
  public isRunning(process: P): boolean {
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
  //#endregion Process Management
}

export { ProcessController };
