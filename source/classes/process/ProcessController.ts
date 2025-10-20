import {
  spawn,
  type ChildProcess,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";

import type { IProcessControllerOptions } from "@/types/process";
import type { IProcessController } from "@/definitions/process/IProcessController";

/**
 * A class that provides methods for managing active processes.
 *
 * @template P - Type of the process instance.
 * @template O - Type of the options object.
 * @documentation [view on GitHub](https://github.com/octovel/environment-node/blob/stable/docs/guides/process-controller.md)
 */
class ProcessController<P extends ChildProcess>
  implements IProcessController<P>
{
  //#region Process Management
  /**
   * Starts a new child process with the given command and arguments.
   *
   * @param command - The executable command to run.
   * @param args - A readonly array of string arguments to pass to the command.
   * @param options - Optional options controlling spawn behavior.
   * @returns The newly created `ChildProcessWithoutNullStreams` instance.
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
   * @param process - The `ChildProcess` instance to terminate.
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
