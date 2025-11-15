import platform

class SystemEnvironment:
    """Provides methods for managing system-level environment information.

    This class abstracts platform-specific details for retrieving system
    information like OS, CPU, and memory. On Linux, it directly parses
    /proc filesystem entries to avoid external dependencies.
    """

    def get_cpu_info(self) -> dict:
        """Retrieves CPU information.

        On Linux, this method parses `/proc/cpuinfo` to extract the CPU model name.
        For other platforms, it attempts to use `platform.processor()` or returns 'unknown'.

        Returns:
            dict: A dictionary containing CPU information, typically with a 'model' key.
        """
        if platform.system() == "Linux":
            try:
                with open("/proc/cpuinfo", "r") as f:
                    for line in f:
                        if "model name" in line:
                            return {"model": line.split(":")[1].strip()}
            except FileNotFoundError:
                return {"model": "unknown"}
        return {"model": platform.processor() or "unknown"}

    def get_memory_info(self) -> dict:
        """Retrieves system memory information.

        On Linux, this method parses `/proc/meminfo` to extract the total memory.
        For other platforms, it returns 0 for total memory.

        Returns:
            dict: A dictionary containing memory information, typically with a 'total' key
                  representing total memory in bytes.
        """
        if platform.system() == "Linux":
            try:
                with open("/proc/meminfo", "r") as f:
                    for line in f:
                        if "MemTotal" in line:
                            parts = line.split()
                            # Value is in KB, convert to bytes
                            return {"total": int(parts[1]) * 1024}
            except FileNotFoundError:
                return {"total": 0}
        return {"total": 0} # Placeholder for non-Linux
