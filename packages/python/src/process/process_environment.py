import os


class ProcessEnvironment:
    """Provides methods for managing process-level environment variables.

    This class interacts with the os envrionment map
    to set, get, and remove environment variables.
    """

    def get(self, name: str, default: str | None = None) -> str:
        """Retrieves the value of a process environment variable.

        This method reads os environ map to find the specified environment variable.

        Args:
            name (str): The name of the environment variable to retrieve.
            default (str | None): Default value to return if no value is found, if no default is provided a KeyError is raised.

        Returns:
            str: The value of the environment variable if found, otherwise a runtime error is raised.
        """
        try:
            return os.environ[name]
        except KeyError as e:
            if default:
                return default
            # the user should handle this if no default is provided
            raise KeyError(
                f"{type(e).__name__}: envrionment variable key `{name}` not found and no default value provided."
            )

    def set(self, name: str, value: str, overwrite: bool = False):
        """Sets or updates a process environment variable.

        This method safely sets a process environment variable.
        Use delete first, then set to update an existing variable, without using overwrite.
        Use overwrite to just overwrite any existing variable with the same name.

        Args:
            name (str): The name of the environment variable to set.
            value (str): The value to assign to the environment variable.
            overwrite (bool): Will overwrite any existing key with the same name if `True`.

        Raises:
            RuntimeError: When setting an replacing an existing envrionment variable's variable and overwrite is false
        """
        if not overwrite and name in os.environ:
            raise RuntimeError(
                f": Envrionment variable key `{name}` already exists.\n Use overwrite=True to replace the existing value"
            )
        # set the kv pair
        os.environ[name] = value

    def remove(self, name: str) -> bool:
        """Removes a process environment variable.

        This method deletes the corresponding key-value pair from the os.environ map

        Args:
            name (str): The name of the environment variable to remove.

        Returns:
            bool: Whether or not the value was removed. True if the value was removed, False if not or no value existed.
        """
        # ensure name exists
        if name not in os.environ:
            return False
        # remove the pair
        del os.environ[name]
        return True

    def list_keys(self) -> list[str]:
        """Lists all process-level environment variable keys.

        This method gets all defined environment variable names/keys from the environment map.

        Warning:
            This function is not thread-safe.
            Calling it while the environment is being modified in an other thread is an undefined behavior.

        Returns:
            list[str]: A list of environment variable names.
        """
        # ensure envrion is updated
        os.reload_environ() # type: ignore[attr-defined] pyright doesnt accept this yet bc its new
        keys = list(os.environ.keys())
        return keys

    def list_values(self) -> list[str]:
        """Lists all process-level environment variable values.

        This method gets all defined environment variable values from the environment map.

        Warning:
            This function is not thread-safe.
            Calling it while the environment is being modified in an other thread is an undefined behavior.

        Returns:
            list[str]: A list of environment variable values.
        """
        # ensure envrion is updated
        os.reload_environ() # type: ignore[attr-defined]
        values = list(os.environ.values())
        return values
