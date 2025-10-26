import {
  spawn,
  type ChildProcess,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";

import { platform } from "node:os";

import type { IProcessControllerOptions } from "@/types/process";
import type { IProcessController } from "@/definitions/process/IProcessController";

/**
 * This class provides a set of methods for managing and controlling child processes in Node.js.
 * It allows for the creation, monitoring, and termination of child processes.
 *
 * @template P - Generic type representing the child process.
 * @documentation [view on GitHub](https://github.com/octovel/environment/blob/stable/packages/node/docs/guides/process-controller.md)
 */
class ProcessController<P extends ChildProcess>
  implements IProcessController<P>
{
  private static readonly IS_WINDOWS = platform() === "win32";

  //#region Process Management
  /**
   * Starts a new child process.
   *
   * @param command - The executable command to run.
   * @param args - An array of string arguments to pass to the command.
   * @param options - Optional spawn configuration, including working directory,
   *                  environment variables, and detached mode.
   * @returns A `ChildProcessWithoutNullStreams` instance representing the spawned process.
   */
  public start(
    command: string,
    args: Readonly<Array<string>>,
    options?: IProcessControllerOptions,
  ): ChildProcessWithoutNullStreams {
    if (!command?.trim() || !Array.isArray(args)) {
      throw new Error("Invalid command or arguments");
    }

    return spawn(command, args, {
      cwd: options?.cwd ?? process.cwd(),
      env: options?.env ? { ...process.env, ...options.env } : process.env,
      detached: options?.detached ?? false,
      stdio: "pipe",
    });
  }

  /**
   * Stops a running child process gracefully using the specified signal,
   * with optional timeout and fallback to force kill.
   *
   * @param process - The process to terminate.
   * @param signal - Signal to send for graceful termination (default: `"SIGTERM"`).
   * @param timeout - Maximum time to wait for graceful exit before sending `SIGKILL` (default: 5000ms).
   * @returns A Promise resolving to `true` if the process was terminated successfully, `false` otherwise.
   */
  public async stop(
    process: P,
    signal: NodeJS.Signals = "SIGTERM",
    timeout = 5000,
  ): Promise<boolean> {
    if (!this.isRunning(process)) return false;

    try {
      if (ProcessController.IS_WINDOWS) {
        const killer: ChildProcessWithoutNullStreams = spawn("taskkill", [
          "/PID",
          String(process.pid),
          "/T",
          "/F",
        ]);
        await new Promise<void>((r) => {
          killer.once("exit", r);
          killer.once("close", r);
        });
        await new Promise((r) => setTimeout(r, 300));
        return !this.isRunning(process);
      }

      process.kill(signal);

      const exited: boolean = await new Promise<boolean>((r) => {
        const t: NodeJS.Timeout = setTimeout(() => r(false), timeout);
        const done: () => void = (): void => {
          clearTimeout(t);
          r(true);
        };
        process.once("exit", done);
        process.once("close", done);
      });

      if (!exited && this.isRunning(process)) {
        process.kill("SIGKILL");
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restarts a running process by first stopping it and then starting a new one
   * with the provided command and arguments.
   *
   * @param process - The currently running process to restart.
   * @param command - The executable command for the new process.
   * @param args - Array of command-line arguments for the new process.
   * @param options - Optional spawn configuration for the new process.
   * @returns A Promise resolving to the new `ChildProcessWithoutNullStreams` instance.
   * @throws Will throw if stopping the existing process fails.
   */
  public async restart(
    process: P,
    command: string,
    args: Readonly<Array<string>>,
    options?: IProcessControllerOptions,
  ): Promise<ChildProcessWithoutNullStreams> {
    if (!(await this.stop(process))) {
      throw new Error("Failed to stop process");
    }
    await new Promise((r) => setTimeout(r, 1000)); // gives the OS time to release resources
    return this.start(command, args, options);
  }

  /**
   * Checks if a process is currently alive.
   *
   * A process is considered running if it has a valid PID, is not killed,
   * and has no exit code.
   *
   * @param process - The process to check.
   * @returns `true` if the process is alive, `false` otherwise.
   */
  public isRunning(process: P): boolean {
    if (!process?.pid || process.exitCode !== null || process.killed) {
      return false;
    }

    try {
      process.kill(0);
      return true;
    } catch (error: any) {
      return error.code === "EPERM";
    }
  }
  //#endregion Process Management
}

export { ProcessController };
