from dataclasses import dataclass
import subprocess

from src.dataclass.process import ProcessInfo


@dataclass
class ProcessRecord:
    """Dataclass to define a singular process record"""

    info: ProcessInfo
    instance: subprocess.Popen[str] | subprocess.Popen[bytes]


class ProcessRegistry:
    """A ProcessRegistry is a class with a dictionary whose key is the pid,
    and the value is the metadata and its process instance"""

    def __init__(self) -> None:
        self._registry: dict[int, ProcessRecord] = {}

    def add(
        self,
        info: ProcessInfo,
        instance: subprocess.Popen[str] | subprocess.Popen[bytes],
    ) -> None:
        """Add a record into the registry, ensuring the record has not already been added"""
        if info.pid in self._registry:
            raise ValueError(
                f"Registry entry with pid {info.pid} already exists in registry: {self._registry[info.pid].info.command}"
            )
        self._registry[info.pid] = ProcessRecord(info=info, instance=instance)

    def remove(self, pid: int) -> bool:
        """Remove a record from the registry, ensuring the record exists in the registry"""
        if pid not in self._registry:
            return False
        del self._registry[pid]
        return True

    def get(self, pid: int) -> ProcessRecord | None:
        """Return a record from the registry"""
        return self._registry[pid]

    def list(self) -> list[ProcessRecord]:
        """Return record values as a list"""
        return list(self._registry.values())

    def exits(self, pid: int) -> bool:
        """Check if a process exists in the registry"""
        return pid in self._registry

    def clear(self) -> int:
        """Clears the registry and returns the number of records cleared"""
        count = len(self._registry)
        self._registry.clear()
        return count

    def count(self) -> int:
        """Returns the count of processes in the registry"""
        return len(self._registry)
