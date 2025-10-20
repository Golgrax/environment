import type {
  ChildProcess,
  ChildProcessWithoutNullStreams,
} from "node:child_process";

import type { IProcessControllerOptions } from "@/types/process";

/**
 * An interface representing the structure of the main `ProcessController` class.
 */
interface IProcessController<
  P extends ChildProcess,
  O extends IProcessControllerOptions = IProcessControllerOptions,
> {
  //#region Process Management
  start(
    command: string,
    args: Array<string>,
    options?: O,
  ): ChildProcessWithoutNullStreams;
  stop(process: P, signal: NodeJS.Signals): boolean;
  restart(
    process: P,
    command: Readonly<string>,
    args: Array<string>,
    options?: O,
  ): ChildProcessWithoutNullStreams;
  isRunning(process: P): boolean;
  //#endregion Process Management
}

export { IProcessController };
