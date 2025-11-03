import platform
import subprocess
import os

class UserEnvironment:
    def __init__(self):
        self.platform = platform.system()

    def getOS(self):
        return self.platform

    def getCPU(self):
        if self.platform == "Linux":
            # This is a simplified way to get CPU info on Linux
            with open("/proc/cpuinfo") as f:
                for line in f:
                    if "model name" in line:
                        return {"model": line.split(":")[1].strip(), "speed": 0}
        elif self.platform == "Darwin":
            # This is a simplified way to get CPU info on macOS
            return {"model": subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"]).decode().strip(), "speed": 0}
        return {"model": "unknown", "speed": 0}

    def getMemory(self):
        if self.platform == "Linux":
            with open("/proc/meminfo") as f:
                lines = f.readlines()
                total = int(lines[0].split()[1])
                free = int(lines[1].split()[1])
                return {"total": total, "free": free}
        # Simplified for other platforms
        return {"total": 0, "free": 0}

    def get(self, name, default_value=None):
        env_file = os.path.expanduser("~/.bashrc")
        if not os.path.exists(env_file):
            return default_value
        with open(env_file) as f:
            for line in f:
                if line.startswith(f"export {name}="):
                    return line.split("=")[1].strip().strip('"')
        return default_value

    def set(self, name, value):
        env_file = os.path.expanduser("~/.bashrc")
        lines = []
        if os.path.exists(env_file):
            with open(env_file, "r") as f:
                lines = f.readlines()
        
        new_line = f'export {name}="{value}"\n'
        found = False
        for i, line in enumerate(lines):
            if line.startswith(f"export {name}="):
                lines[i] = new_line
                found = True
                break
        
        if not found:
            lines.append(new_line)

        with open(env_file, "w") as f:
            f.writelines(lines)

    def remove(self, name):
        env_file = os.path.expanduser("~/.bashrc")
        if not os.path.exists(env_file):
            return
        with open(env_file, "r") as f:
            lines = f.readlines()
        with open(env_file, "w") as f:
            for line in lines:
                if not line.startswith(f"export {name}="):
                    f.write(line)

    def listKeys(self):
        keys = []
        env_file = os.path.expanduser("~/.bashrc")
        if not os.path.exists(env_file):
            return keys
        with open(env_file) as f:
            for line in f:
                if line.startswith("export "):
                    parts = line.split(" ", 1)[1].split("=", 1)
                    keys.append(parts[0])
        return keys

    def listValues(self):
        values = []
        env_file = os.path.expanduser("~/.bashrc")
        if not os.path.exists(env_file):
            return values
        with open(env_file) as f:
            for line in f:
                if line.startswith("export "):
                    parts = line.split("=", 1)
                    if len(parts) > 1:
                        values.append(parts[1].strip().strip('"'))
        return values
