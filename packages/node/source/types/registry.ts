/**
 * An enum representing the different windows registries.
 */
export enum WindowsRegistry {
  HKCU = "HKCU\\Environment",
  HKLM = "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
}

/**
 * An enum representing the different windows registry types.
 */
export enum WindowsRegistryType {
  /** String literal */
  REG_SZ = "REG_SZ",
  /** String literal with expansion (recommended) */
  REG_EXPAND_SZ = "REG_EXPAND_SZ",
  /** String literal */
  REG_MULTI_SZ = "REG_MULTI_SZ",
  /** String literal */
  REG_DWORD = "REG_DWORD",
  /** String literal */
  REG_QWORD = "REG_QWORD",
  /** String literal */
  REG_BINARY = "REG_BINARY",
}
