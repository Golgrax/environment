import os

class Process:
    """Provides methods for retrieving information about the current process.
    """

    def get_process_id(self) -> int:
        """Retrieves the process ID (PID) of the current process.

        Returns:
            int: The process ID of the current process.
        """
        return os.getpid()

    def get_command_line_arguments(self) -> list[str]:
        """Retrieves the command-line arguments of the current process.

        Returns:
            list[str]: A list of strings representing the command-line arguments.
                       The first element is typically the script name.
        """
        return os.sys.argv



