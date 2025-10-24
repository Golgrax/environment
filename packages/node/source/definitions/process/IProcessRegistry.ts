import type { ChildProcess } from "node:child_process";

import type { IProcessInfo } from "@/types/process";

/**
 * This interface represents the structure and implementation of the `ProcessRegistry` class.
 *
 * @template P - The type of the Node.js ChildProcess instance.
 * @template I - The type of the process metadata.
 *
 * @internal This interface is used internally and is not intended for external use.
 */
interface IProcessRegistry<
  P extends ChildProcess = ChildProcess,
  I extends IProcessInfo = IProcessInfo,
> {
  //#region Core Operations
  add(info: I, instance: P): void;
  remove(pid: number): void;
  get(pid: number): (I & { instance: P }) | undefined;
  list(): ReadonlyArray<Readonly<I & { instance: P }>>;
  exists(pid: number): boolean;
  //#endregion Core Operations

  //#region Utility Operations
  clear(): number;
  count(): number;
  //#endregion Utility Operations
}

export type { IProcessRegistry };
