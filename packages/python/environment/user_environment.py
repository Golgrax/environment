import os
import subprocess

class UserEnvironment:
    """Provides methods for managing user-level environment variables.

    This class interacts with the user's shell configuration files (e.g., .bashrc)
    to set, get, and remove environment variables. It is designed to be
    cross-platform, though current implementation details might be Linux/macOS-centric.
    """

    def _get_rc_file_path(self) -> str:
        """Determines the appropriate shell configuration file path for the current user.

        This method attempts to identify the user's shell and return the path to its
        corresponding RC file (e.g., ~/.bashrc, ~/.zshrc).

        Returns:
            str: The absolute path to the shell's RC file.
        """
        shell = os.environ.get("SHELL", "/bin/bash")
        home_dir = os.path.expanduser("~/")

        if "bash" in shell:
            return os.path.join(home_dir, ".bashrc")
        elif "zsh" in shell:
            return os.path.join(home_dir, ".zshrc")
        # Add more shell detections as needed
        return os.path.join(home_dir, ".profile")

    def get(self, name: str) -> str or None:
        """Retrieves the value of a user environment variable.

        This method reads the user's shell configuration file to find the specified
        environment variable. It looks for lines in the format 'export NAME="value"'.

        Args:
            name (str): The name of the environment variable to retrieve.

        Returns:
            str or None: The value of the environment variable if found, otherwise None.
        """
        rc_file_path = self._get_rc_file_path()
        if not os.path.exists(rc_file_path):
            return None

        with open(rc_file_path, "r") as f:
            for line in f:
                if line.strip().startswith(f"export {name}="):
                    # Extract the value, removing quotes
                    return line.split("=", 1)[1].strip().strip('"\'')
        return None

    def set(self, name: str, value: str):
        """Sets or updates a user environment variable.

        This method modifies the user's shell configuration file. If the variable
        already exists, its value is updated. If not, a new 'export' line is added.

        Args:
            name (str): The name of the environment variable to set.
            value (str): The value to assign to the environment variable.
        """
        rc_file_path = self._get_rc_file_path()
        lines = []
        found = False

        if os.path.exists(rc_file_path):
            with open(rc_file_path, "r") as f:
                for line in f:
                    if line.strip().startswith(f"export {name}="):
                        lines.append(f"export {name}=\"{value}\"\n")
                        found = True
                    else:
                        lines.append(line)
        
        if not found:
            lines.append(f"export {name}=\"{value}\"\n")

        with open(rc_file_path, "w") as f:
            f.writelines(lines)

    def remove(self, name: str):
        """Removes a user environment variable.

        This method deletes the corresponding 'export' line from the user's
        shell configuration file.

        Args:
            name (str): The name of the environment variable to remove.
        """
        rc_file_path = self._get_rc_file_path()
        if not os.path.exists(rc_file_path):
            return

        lines = []
        with open(rc_file_path, "r") as f:
            for line in f:
                if not line.strip().startswith(f"export {name}="):
                    lines.append(line)
        
        with open(rc_file_path, "w") as f:
            f.writelines(lines)

    def list_keys(self) -> list[str]:
        """Lists all user-level environment variable keys.

        This method parses the user's shell configuration file to find all
        defined environment variable names.

        Returns:
            list[str]: A list of environment variable names.
        """
        rc_file_path = self._get_rc_file_path()
        keys = []
        if not os.path.exists(rc_file_path):
            return keys

        with open(rc_file_path, "r") as f:
            for line in f:
                if line.strip().startswith("export "):
                    parts = line.split("=", 1)
                    if len(parts) > 0:
                        keys.append(parts[0].replace("export ", "").strip())
        return keys

    def list_values(self) -> list[str]:
        """Lists all user-level environment variable values.

        This method parses the user's shell configuration file to find all
        defined environment variable values.

        Returns:
            list[str]: A list of environment variable values.
        """
        rc_file_path = self._get_rc_file_path()
        values = []
        if not os.path.exists(rc_file_path):
            return values

        with open(rc_file_path, "r") as f:
            for line in f:
                if line.strip().startswith("export "):
                    parts = line.split("=", 1)
                    if len(parts) > 1:
                        values.append(parts[1].strip().strip('\"\''))
        return values
