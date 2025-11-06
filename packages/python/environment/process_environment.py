import os
import getpass

class ProcessEnvironment:
    def get_user_name(self):
        """Retrieves the username of the current user.

        Returns:
            str: The username of the current user.
        """
        return getpass.getuser()

    def get_home_directory(self):
        """Retrieves the home directory path of the current user.

        Returns:
            str: The absolute path to the current user's home directory.
        """
        return os.path.expanduser("~")
