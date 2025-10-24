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
 * An interface representing the options for a process controller.
 */
export interface IProcessControllerOptions {
  /** The working directory for the process. */
  cwd?: string;
  /** The environment variables for the process. */
  env?: NodeJS.ProcessEnv;
  /** The detached state of the process. */
  detached?: boolean;
  /** The restartOnFail state of the process. */
  restartOnFail?: boolean;
  /** The autoRestart state of the process. */
  autoRestart?: boolean;
  /** The maximum number of restarts for the process. */
  maxRestarts?: number;
}

/**
 * An interface representing the information about a process.
 */
export interface IProcessInfo {
  /** The process ID. */
  pid: number;
  /** The command used to start the process. */
  command: string;
  /** The arguments used to start the process. */
  args: string[];
  /** The status of the process. */
  status: ProcessStatus;
  /** The date and time when the process was started. */
  startedAt: Date | number;
  /** The date and time when the process was stopped. */
  stoppedAt?: Date | number;
  /** The exit code of the process. */
  exitCode?: number | null;
  /** The CPU usage of the process. */
  cpuUsage?: NodeJS.CpuUsage;
  /** The memory usage of the process. */
  memoryUsage?: NodeJS.MemoryUsage;
  /** The environment variables of the process. */
  environment?: Record<string, string>;
}

/**
 * An enum representing the different status of a process.
 */
export enum ProcessStatus {
  /** The process is running. */
  Running = "running",
  /** The process has been stopped. */
  Stopped = "stopped",
  /** The process has encountered an error. */
  Errored = "errored",
  /** The process is restarting. */
  Restarting = "restarting",
}
