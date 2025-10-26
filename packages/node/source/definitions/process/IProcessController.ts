import type {
  ChildProcess,
  ChildProcessWithoutNullStreams,
} from "node:child_process";

import type { IProcessControllerOptions } from "@/types/process";

/**
 * This interface represents the structure and implementation of the `ProcessController` class.
 *
 * @template P - The type of the Node.js ChildProcess instance.
 * @template O - The type of the controller options.
 *
 * @internal This interface is used internally and is not intended for external use.
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

  stop(process: P, signal: NodeJS.Signals, timeout: number): Promise<boolean>;
  restart(
    process: P,
    command: Readonly<string>,
    args: Array<string>,
    options?: O,
  ): Promise<ChildProcessWithoutNullStreams>;

  isRunning(process: P): boolean;
  //#endregion Process Management
}

export { IProcessController };
