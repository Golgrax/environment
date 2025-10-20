import crypto from "node:crypto";

import { EncryptionAlgorithm } from "@/types/encryption";
import type { IEnvironmentSchema } from "@/types/process";
import type {
  HookType,
  IProcessManager,
} from "@/definitions/process/IProcessManager";

/**
 * Represents a callback function for environment lifecycle hooks
 * triggered by the `ProcessManager` class.
 *
 * @template S - The environment schema type.
 * @template K - The key within the environment schema.
 */
type HookCallback<S extends IEnvironmentSchema, K extends keyof S = keyof S> = (
  key: K,
  newValue?: S[K],
  oldValue?: S[K],
) => void | Promise<void>;

/**
 * Represents a temporary value stored in the environment.
 *
 * @template K - The key of the variable.
 * @template V - The type of the variable's value.
 */
interface TemporaryValue<K extends PropertyKey, V> {
  key: K;
  value: V;
  expiresAt: number;
}

/**
 * A strongly typed and feature-rich environment variable manager.
 *
 * Provides advanced features such as:
 * - Hook registration and lifecycle events
 * - Snapshotting and restoring environment state
 * - Temporary and conditional variable management
 * - One-way hashing (and future encryption support)
 * - Computation helpers and auto-cleaning of expired values
 *
 * @template S - The environment schema interface.
 */
class ProcessManager<S extends IEnvironmentSchema>
  implements IProcessManager<S>
{
  /** Stores hook callbacks registered for various environment lifecycle events. */
  private _hooks: Record<HookType, Array<HookCallback<S>>> = {
    add: [],
    delete: [],
    update: [],
    clear: [],
    change: [],
  };

  /** The latest captured snapshot of the environment state. */
  private _snapshot: Partial<S> = {};

  /** Stores temporary environment variables with expiration times. */
  private _temporary: Map<
    keyof S,
    TemporaryValue<keyof S, S[keyof S] | undefined>
  > = new Map();

  //#region Base methods
  /**
   * Sets a variable in the environment.
   *
   * If the variable already exists, it is updated and the previous value is returned.
   * Hooks for `update` or `add` events are triggered accordingly.
   *
   * @param key - The key of the variable to set.
   * @param value - The value to assign.
   * @returns The previous value if it existed, otherwise `undefined`.
   */
  public set<K extends keyof S>(
    /** The key of the variable to set. */
    key: K,
    /** The value to set. */
    value: S[K],
  ): S[K] | undefined {
    const oldValue = process.env[key as string] as unknown as S[K];
    process.env[key as string] = String(value);

    // Trigger hooks
    if (oldValue === undefined) this.triggerHook("add", key, value);
    else this.triggerHook("update", key, value, oldValue);

    return oldValue;
  }

  /**
   * Retrieves a variable from the environment.
   *
   * If the variable is temporary and expired, it will be automatically removed.
   *
   * @param key - The key of the variable to retrieve.
   * @param options - Optional fallback value if the key does not exist.
   * @returns The current value or the provided fallback.
   */
  public get<K extends keyof S>(
    /** The key of the variable to get. */
    key: K,
    /** The options for the get operation. */
    options?: {
      /** The fallback value to return if the variable is not found. */
      fallback?: S[K];
    },
  ): S[K] | undefined {
    const temp = this._temporary.get(key);
    if (temp && temp.expiresAt > Date.now()) return temp.value as S[K];
    if (temp) this._temporary.delete(key);

    const val = process.env[key as string] as unknown as S[K];
    return val !== undefined ? val : options?.fallback;
  }

  /**
   * Checks whether a variable exists in the environment.
   *
   * @param key - The variable key.
   * @returns `true` if the variable exists, otherwise `false`.
   */
  public has<K extends keyof S>(key: K): boolean {
    return process.env[key as string] !== undefined;
  }

  /**
   * Deletes a variable from the environment.
   *
   * Triggers a `delete` hook if applicable.
   *
   * @param key - The variable key.
   * @returns The deleted value, or `undefined` if it didn't exist.
   */
  public delete<K extends keyof S>(key: K): S[K] | undefined {
    if (!this.has(key)) return undefined;
    const oldValue = process.env[key as string] as unknown as S[K];
    delete process.env[key as string];
    this.triggerHook("delete", key, undefined, oldValue);
    return oldValue;
  }

  /**
   * Lists all environment variables, optionally including their values.
   *
   * @param options - Whether to include values in the returned object.
   * @returns A list of keys or a key-value record depending on `options`.
   */
  public list(options: { includeValue: true }): Record<keyof S, S[keyof S]>;
  public list(options?: { includeValue?: false }): (keyof S)[];
  public list(options?: {
    includeValue?: boolean;
  }): Array<keyof S> | Record<keyof S, S[keyof S]> {
    if (options?.includeValue) {
      const result: Partial<Record<keyof S, S[keyof S]>> = {};
      Object.keys(process.env).forEach(
        (k) =>
          (result[k as keyof S] = process.env[k]! as unknown as S[keyof S]),
      );
      return result as Record<keyof S, S[keyof S]>;
    }
    return Object.keys(process.env) as Array<keyof S>;
  }

  /**
   * Returns an array of all environment variable keys.
   *
   * @returns An array of keys.
   */
  public listKeys(): Array<keyof S> {
    return Object.keys(process.env) as Array<keyof S>;
  }

  /**
   * Returns an array of all environment variable values.
   *
   * @returns An array of values.
   */
  public listValues(): Array<S[keyof S]> {
    return Object.values(process.env) as S[keyof S][];
  }

  /**
   * Filters environment keys based on a predicate function.
   *
   * @param predicate - Function used to determine which keys to include.
   * @returns An array of keys matching the predicate.
   */
  public filterKeys(
    predicate: (key: keyof S, value: S[keyof S]) => boolean,
  ): Array<keyof S> {
    return (Object.keys(process.env) as Array<keyof S>).filter((k) =>
      predicate(k, process.env[k]! as unknown as S[keyof S]),
    );
  }

  /**
   * Filters environment values based on a predicate function.
   *
   * @param predicate - Function used to determine which values to include.
   * @returns An array of values matching the predicate.
   */
  public filterValues(
    predicate: (value: S[keyof S], key: keyof S) => boolean,
  ): Array<S[keyof S]> {
    return (Object.entries(process.env) as [keyof S, S[keyof S]][])
      .filter(([k, v]) => predicate(v, k))
      .map(([_, v]) => v);
  }
  //#endregion Base methods

  //#region Snapshots
  /**
   * Captures the current state of the environment as a snapshot.
   *
   * @returns A copy of the current environment variables.
   */
  public snapshot(): S {
    const snap = {} as S;
    (Object.keys(process.env) as Array<keyof S>).forEach((k) => {
      snap[k] = process.env[k] as unknown as S[keyof S];
    });
    this._snapshot = snap;
    return snap;
  }

  /**
   * Restores the environment from a given snapshot.
   *
   * Clears the current environment before restoration.
   *
   * @param snapshot - The snapshot object to restore.
   */
  public restore(snapshot: S): void {
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    Object.keys(snapshot).forEach(
      (k) => (process.env[k] = String(snapshot[k as keyof S])),
    );
  }
  //#endregion

  //#region Hooks
  /**
   * Registers a hook for the `add` event.
   * Triggered when a new variable is created.
   *
   * @param callback - The callback function to execute.
   * @returns A function to unregister the hook.
   */
  public onAdd<K extends keyof S>(
    callback: (key: K, newValue: S[K]) => void | Promise<void>,
  ): () => void {
    return this.registerHook("add", callback);
  }

  /**
   * Registers a hook for the `delete` event.
   * Triggered when a variable is removed.
   *
   * @param callback - The callback function to execute.
   * @returns A function to unregister the hook.
   */
  public onDelete<K extends keyof S>(
    callback: (key: K, newValue: S[K]) => void | Promise<void>,
  ): () => void {
    return this.registerHook("delete", callback);
  }

  /**
   * Registers a hook for the `update` event.
   * Triggered when an existing variable changes value.
   *
   * @param callback - The callback function to execute.
   * @returns A function to unregister the hook.
   */
  public onUpdate<K extends keyof S>(
    callback: (key: K, newValue: S[K], oldValue?: S[K]) => void | Promise<void>,
  ): () => void {
    return this.registerHook("update", callback);
  }

  /**
   * Registers a hook for the `clear` event.
   * Triggered when the environment is cleared.
   *
   * @param callback - The callback function to execute.
   * @returns A function to unregister the hook.
   */
  public onClear<K extends keyof S>(
    callback: (key: K, oldValue: S[K]) => void | Promise<void>,
  ): () => void {
    return this.registerHook("clear", callback);
  }

  /**
   * Registers a hook for any environment event type.
   *
   * @param type - The event type to subscribe to.
   * @param callback - The callback to execute on event.
   * @returns A cleanup function to unregister the hook.
   */
  public on<K extends keyof S>(
    type: HookType,
    callback: (
      key: K,
      newValue?: S[K],
      oldValue?: S[K],
    ) => void | Promise<void>,
  ): () => void {
    return this.registerHook(type, callback);
  }

  /** Registers a hook internally and returns a cleanup function. */
  private registerHook<K extends keyof S>(
    type: HookType,
    callback: (key: K, newValue: S[K], oldValue?: S[K]) => void | Promise<void>,
  ): () => void {
    this._hooks[type].push(callback as HookCallback<S>);
    return () => {
      this._hooks[type] = this._hooks[type].filter((cb) => cb !== callback);
    };
  }

  /** Triggers all callbacks associated with a specific hook type. */
  private triggerHook(
    type: HookType,
    key: keyof S,
    newValue?: S[keyof S],
    oldValue?: S[keyof S],
  ) {
    for (const cb of this._hooks[type]) cb(key, newValue, oldValue);
    for (const cb of this._hooks.change) cb(key, newValue, oldValue);
  }
  //#endregion

  //#region Temporary / Conditional / Encryption
  /**
   * Sets a variable temporarily in memory.
   *
   * The value will expire automatically after the provided TTL (in milliseconds).
   *
   * @param key - The variable key.
   * @param value - The variable value.
   * @param options - Optional TTL configuration.
   * @returns The previous value if it existed.
   */
  public setTemporary<K extends keyof S>(
    key: K,
    value: S[K],
    options?: { ttl: number },
  ): S[K] | undefined {
    const oldValue = process.env[key as string] as unknown as S[K];
    const expiresAt = Date.now() + (options?.ttl ?? 0);
    this._temporary.set(key, { key, value, expiresAt });
    return oldValue;
  }

  /**
   * Sets a variable only if the provided condition returns true.
   *
   * @param key - The variable key.
   * @param value - The variable value.
   * @param condition - The condition to check before setting the variable.
   * @returns The previous value if it existed.
   */
  public setConditional<K extends keyof S>(
    key: K,
    value: S[K],
    condition: (...args: any[]) => boolean,
  ): S[K] | undefined {
    if (condition()) return this.set(key, value);
    return undefined;
  }

  /**
   * Hashes and stores a variable using the specified algorithm.
   *
   * This is a one-way operation and cannot be reversed.
   *
   * @param key - The variable key.
   * @param value - The variable value.
   * @param options - Hashing algorithm (default: SHA256).
   * @returns The previous value if it existed.
   */
  public setHashed<K extends keyof S>(
    key: K,
    value: S[K],
    options?: { algorithm: EncryptionAlgorithm },
  ): S[K] | undefined {
    const algo = options?.algorithm ?? EncryptionAlgorithm.SHA256;
    const hash = crypto
      .createHash(algo)
      .update(String(value))
      .digest("hex") as unknown as S[K];
    return this.set(key, hash);
  }

  /**
   * Hashes and sets a variable only if a condition evaluates to true.
   *
   * @param key - The variable key.
   * @param value - The variable value.
   * @param condition - The condition to check before setting the variable.
   * @param options - Hashing algorithm (default: SHA256).
   * @returns The previous value if it existed.
   */
  public setEncryptedConditional<K extends keyof S>(
    key: K,
    value: S[K],
    condition: (...args: any[]) => boolean,
    options?: { algorithm: EncryptionAlgorithm },
  ): S[K] | undefined {
    if (condition()) return this.setHashed(key, value, options);
    return undefined;
  }

  /**
   * Retrieves the hashed (one-way) value of a variable.
   *
   * @note Hashes cannot be decrypted. This method returns the stored hash string.
   */
  public getHashed<K extends keyof S>(key: K): S[K] | undefined {
    // In practice, hash cannot be decrypted, but this can be extended with real encryption.
    return process.env[key as string] as unknown as S[K];
  }
  //#endregion

  // //#region Helpers
  /**
   * Retrieves a variable or returns the fallback value if undefined.
   *
   * @param key - The key of the variable.
   * @param fallback - The fallback value to return if the variable is undefined.
   * @returns The existing value or the fallback value.
   */
  public getOrDefault<K extends keyof S>(key: K, fallback: S[K]): S[K] {
    return this.get(key) ?? fallback;
  }

  /**
   * Retrieves a variable or computes its value using the provided function.
   *
   * @param key - The key of the variable.
   * @param compute - Function that computes the value if missing.
   * @returns The existing or computed value.
   */
  public async getOrCompute<K extends keyof S>(
    key: K,
    compute: (key: K) => S[K] | Promise<S[K]>,
  ): Promise<S[K]> {
    const val = this.get(key);
    if (val !== undefined) return val;
    const computed = await compute(key);
    this.set(key, computed);
    return computed;
  }

  /**
   * Increments a numeric environment variable by a delta value.
   *
   * @param key - The key of the variable.
   * @param delta - The value to increment by.
   * @returns The updated value or undefined if the variable is not numeric.
   */
  public increment<K extends keyof S>(key: K, delta: number): S[K] | undefined {
    const val = Number(this.get(key)) + delta;
    return this.set(key, val as unknown as S[K]);
  }

  /**
   * Decrements a numeric environment variable by a delta value.
   *
   * @param key - The key of the variable.
   * @param delta - The value to decrement by.
   * @returns The updated value or undefined if the variable is not numeric.
   */
  public decrement<K extends keyof S>(key: K, delta: number): S[K] | undefined {
    const val = Number(this.get(key)) - delta;
    return this.set(key, val as unknown as S[K]);
  }

  /**
   * Computes a new value based on the current one and updates it.
   *
   * @param key - The key of the variable.
   * @param computeFn - The function to compute the new value.
   * @returns The updated value or undefined if the variable is not numeric.
   */
  public compute<K extends keyof S>(
    key: K,
    computeFn: (current: S[K] | undefined) => S[K],
  ): S[K] | undefined {
    const current = this.get(key);
    const result = computeFn(current);
    return this.set(key, result);
  }

  /**
   * Removes all expired temporary values from the internal store.
   */
  public cleanExpired(): void {
    for (const [key, temp] of this._temporary.entries()) {
      if (temp.expiresAt <= Date.now()) this._temporary.delete(key);
    }
  }

  /**
   * Clears all environment variables and temporary data.
   */
  public reset(): void {
    Object.keys(process.env).forEach((k) => delete process.env[k]);
    this._temporary.clear();
  }

  /**
   * Prints the environment variables as a raw object.
   */
  public print(): void {
    console.log(process.env);
  }

  /**
   * Prints the environment variables in a formatted table.
   */
  public printPretty(): void {
    console.table(process.env);
  }
  //#endregion
}

export { ProcessManager };
