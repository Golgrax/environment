import os
import getpass

class ProcessEnvironment:
    def get_user_name(self):
        return getpass.getuser()

    def get_home_directory(self):
        return os.path.expanduser("~")
