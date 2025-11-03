import platform
import os
import psutil

class SystemEnvironment:
    def __init__(self, platform_os=None):
        self.platform = platform_os or platform.system()
        if self.platform not in ["Linux", "Darwin"]:
            raise NotImplementedError(f"SystemEnvironment is not implemented for {self.platform}")
        self.env_file = "/etc/environment"

    def getOS(self):
        return self.platform

    def getCPU(self):
        return {"model": platform.processor(), "cores": psutil.cpu_count(logical=False), "speed": psutil.cpu_freq().current}

    def getMemory(self):
        mem = psutil.virtual_memory()
        return {"total": mem.total, "free": mem.free}

    def get(self, name, default_value=None):
        if not os.path.exists(self.env_file):
            return default_value
        with open(self.env_file) as f:
            for line in f:
                if line.startswith(f"{name}="):
                    return line.split("=")[1].strip().strip('"')
        return default_value

    def set(self, name, value):
        # Note: This requires sudo permissions
        lines = []
        if os.path.exists(self.env_file):
            with open(self.env_file, "r") as f:
                lines = f.readlines()
        
        new_line = f'{name}="{value}"\n'
        found = False
        for i, line in enumerate(lines):
            if line.startswith(f"{name}="):
                lines[i] = new_line
                found = True
                break
        
        if not found:
            lines.append(new_line)

        try:
            with open(self.env_file, "w") as f:
                f.writelines(lines)
        except PermissionError:
            print(f"Permission denied: Cannot write to {self.env_file}. Try running with sudo.")

    def remove(self, name):
        # Note: This requires sudo permissions
        if not os.path.exists(self.env_file):
            return
        with open(self.env_file, "r") as f:
            lines = f.readlines()
        with open(self.env_file, "w") as f:
            for line in lines:
                if not line.startswith(f"{name}="):
                    f.write(line)

    def listKeys(self):
        keys = []
        if not os.path.exists(self.env_file):
            return keys
        with open(self.env_file) as f:
            for line in f:
                if "=" in line:
                    keys.append(line.split("=")[0])
        return keys

    def listValues(self):
        values = []
        if not os.path.exists(self.env_file):
            return values
        with open(self.env_file) as f:
            for line in f:
                if "=" in line:
                    values.append(line.split("=")[1].strip().strip('"'))
        return values
