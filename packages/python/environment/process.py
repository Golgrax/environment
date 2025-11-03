import os
import sys
import psutil

class Process:
    def get_process_id(self):
        return os.getpid()

    def get_command_line_arguments(self):
        return sys.argv

    def get_memory_usage(self):
        process = psutil.Process(self.get_process_id())
        return process.memory_info()
