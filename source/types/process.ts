/**
 * A type that represents a primitive value in the environment. It can be a string,
 * a number, or a boolean.
 */
export type ProcessEnvironmentPrimitive = string | number | boolean;

/**
 * A type that represents a complex value in the environment. It can be an array of
 * primitive values or an object with keys and values representing the environment
 * variables.
 */
export type ProcessEnvironmentComplex =
  | Array<ProcessEnvironmentPrimitive>
  | Record<string, unknown>;

/**
 * A type that represents a value in the environment. It can be a primitive value,
 * an array of primitive values, or an object with keys and values representing the
 * environment variables.
 */
export type ProcessEnvironmentValue =
  | ProcessEnvironmentPrimitive
  | ProcessEnvironmentComplex;

/**
 * A type that represents a variable in the environment. It can be a primitive value,
 * an array of primitive values, or an object with keys and values representing the
 * environment variables.
 */
export type ProcessEnvironmentVariable<
  T extends ProcessEnvironmentValue = ProcessEnvironmentValue,
> = T | undefined;

/**
 * An enum representing the scope of the environment. This includes the
 * environment variables that are specific to the current running process,
 * the current user, the entire system, or the environment variables that are
 * stored in a file.
 */
export enum EnvironmentScope {
  /**
   * Represents the environment variables that are specific to the current running process.
   */
  Process = "Process",
  /**
   * Represents the environment variables that are specific to the current user.
   */
  User = "User",
  /**
   * Represents the environment variables that are specific to the entire system.
   */
  System = "System",
  /**
   * Represents the environment variables that are stored in a file.
   */
  File = "File",
  /**
   * Represents the environment variables that are specific to the runtime environment.
   */
  Runtime = "Runtime",
}

/**
 * A type that represents how an environment is structured. It is an object where
 * each key represents a variable name and the value is either a primitive value,
 * an array of primitive values, or another nested object representing a nested
 * structure of variables.
 */
export interface IEnvironmentSchema {
  /** The environment variables. */
  [key: string]: ProcessEnvironmentVariable<ProcessEnvironmentValue>;
}

/**
 * An interface representing
 */
export interface IProcessControllerOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  detached?: boolean;
  restartOnFail?: boolean;
  autoRestart?: boolean;
  maxRestarts?: number;
}
