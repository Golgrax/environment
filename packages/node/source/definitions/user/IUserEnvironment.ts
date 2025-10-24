import type { WindowsRegistryType } from "@/types/registry";

/**
 * This interface represents the structure and implementation of the `UserEnvironment` class.
 *
 * @internal This interface is used internally and is not intended for external use.
 */
interface IUserEnvironment<
  S extends Record<string, string> = Record<string, string>,
> {
  //#region Core Operations
  get<K extends keyof S>(
    name: K,
    options?: {
      defaultValue?: S[K];
      type?: WindowsRegistryType;
    },
  ): S[K] | undefined;

  set<K extends keyof S>(
    name: K,
    value: S[K],
    options?: {
      type?: WindowsRegistryType;
    },
  ): void;

  remove<K extends keyof S>(name: K): void;
  listKeys(): Array<keyof S>;
  listValues(): Array<S[keyof S]>;
  //#endregion Core Operations

  //#region File Operations
  saveToFile(path?: string): Promise<void>;
  //#endregion File Operations
}

export { IUserEnvironment };
