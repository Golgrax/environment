import { EncryptionAlgorithm } from "@/types/encryption";
import type { IEnvironmentSchema } from "@/types/process";

/**
 * A type representing the different types of hooks that can be triggered by the `ProcessManager` class.
 */
export type HookType = "add" | "delete" | "update" | "clear" | "change";

/**
 * This interface represents the structure and implementation of the `ProcessManager` class.
 *
 * @template S The interface representing the schema of the environment variables.
 *
 * @internal This interface is used internally and is not intended for external use.
 */
interface IProcessManager<S extends IEnvironmentSchema> {
  //#region Base methods
  set<K extends keyof S>(key: K, value: S[K]): S[K] | undefined;
  get<K extends keyof S>(
    key: K,
    options?: { fallback?: S[K] | undefined },
  ): S[K] | undefined;

  has<K extends keyof S>(key: K): boolean;
  delete<K extends keyof S>(key: K): S[K] | undefined;
  list(options: { includeValue: true }): Record<keyof S, S[keyof S]>;
  list(options?: { includeValue?: false }): Array<keyof S>;
  listKeys(): Array<keyof S>;
  listValues(): Array<S[keyof S]>;
  filterKeys(
    predicate: (key: keyof S, value: S[keyof S]) => boolean,
  ): Array<keyof S>;

  filterValues(
    predicate: (value: S[keyof S], key: keyof S) => boolean,
  ): Array<S[keyof S]>;
  //#endregion Base methods

  //#region Snapshopts
  snapshot(): S;
  restore(snapshot: S): void;
  //#endregion Snapshots

  //#region Hooks
  onAdd<K extends keyof S>(
    callback: (key: K, newValue: S[K]) => void | Promise<void>,
  ): () => void;

  onDelete<K extends keyof S>(
    callback: (key: K, newValue: S[K]) => void | Promise<void>,
  ): () => void;

  onUpdate<K extends keyof S>(
    callback: (key: K, newValue: S[K], oldValue?: S[K]) => void | Promise<void>,
  ): () => void;

  onClear<K extends keyof S>(
    callback: (key: K, oldValue: S[K]) => void | Promise<void>,
  ): () => void;

  //#region Hooks
  on<K extends keyof S>(
    type: HookType,
    callback: (
      key: K,
      newValue?: S[K],
      oldValue?: S[K],
    ) => void | Promise<void>,
  ): () => void;
  //#endregion Hooks

  //#region Temporary / Conditional / Encryption
  setTemporary<K extends keyof S>(
    key: K,
    value: S[K],
    options?: { ttl: number },
  ): S[K] | undefined;

  setHashed<K extends keyof S>(
    key: K,
    value: S[K],
    options?: { algorithm: EncryptionAlgorithm },
  ): S[K] | undefined;

  getHashed<K extends keyof S>(
    key: K,
    options?: { algorithm: EncryptionAlgorithm },
  ): S[K] | undefined;

  setConditional<K extends keyof S>(
    key: K,
    value: S[K],
    condition: (...args: any[]) => boolean,
  ): S[K] | undefined;

  setEncryptedConditional?<K extends keyof S>(
    key: K,
    value: S[K],
    condition: (...args: any[]) => boolean,
    options?: { algorithm: EncryptionAlgorithm },
  ): S[K] | undefined;
  //#endregion Temporary / Conditional / Encryption

  //#region Helpers
  getOrDefault<K extends keyof S>(key: K, fallback: S[K]): S[K];
  getOrCompute<K extends keyof S>(
    key: K,
    compute: (key: K) => S[K] | Promise<S[K]>,
  ): S[K] | Promise<S[K]>;

  increment<K extends keyof S>(key: K, delta: number): S[K] | undefined;
  decrement<K extends keyof S>(key: K, delta: number): S[K] | undefined;
  compute<K extends keyof S>(
    key: K,
    computeFn: (current: S[K] | undefined) => S[K],
  ): S[K] | undefined;

  print(): void;
  reset(): void;
  printPretty(): void;
  //#endregion Helpers
}

export { IProcessManager };
