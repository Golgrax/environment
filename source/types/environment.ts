/**
 * A type that represents a primitive value in the environment. It can be a string,
 * a number, or a boolean.
 */
export type EnvironmentPrimitive = string | number | boolean;

/**
 * A type that represents a complex value in the environment. It can be an array of
 * primitive values or an object with keys and values representing the environment
 * variables.
 */
export type EnvironmentComplex =
  | Array<EnvironmentPrimitive>
  | Record<string, unknown>;

/**
 * A type that represents a value in the environment. It can be a primitive value,
 * an array of primitive values, or an object with keys and values representing the
 * environment variables.
 */
export type EnvironmentValue = EnvironmentPrimitive | EnvironmentComplex;

/**
 * A type that represents a variable in the environment. It can be a primitive value,
 * an array of primitive values, or an object with keys and values representing the
 * environment variables.
 */
export type EnvironmentVariable<T extends EnvironmentValue = EnvironmentValue> =
  T | undefined;

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
 * An interface that represents the options for an environment. It can be used to
 * specify the scope of an environment variable.
 */
export type EnvironmentOptions = {
  /** The scope of the environment variable. */
  scope?: EnvironmentScope;
};

/**
 * A type that represents how an environment is structured. It is an object where
 * each key represents a variable name and the value is either a primitive value,
 * an array of primitive values, or another nested object representing a nested
 * structure of variables.
 */
export interface IEnvironmentSchema {
  /** The environment variables. */
  [key: string]: EnvironmentVariable<EnvironmentValue>;
}
