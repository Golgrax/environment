from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


class ProcessInfoProtocol(Protocol):
    """Contract for process information structures."""

    pid: int
    command: str
    args: list[str]
    status: str
    started_at: datetime | float
    stopped_at: datetime | float | None
    exit_code: int | None
    cpu_usage: dict[str, float] | None
    memory_usage: dict[str, int] | None
    environment: dict[str, str] | None


@dataclass
class ProcessInfo:
    """Process info provides metadata for a process."""

    pid: int
    command: str
    args: list[str]
    status: str
    started_at: datetime | float
    stopped_at: datetime | float | None = None
    exit_code: int | None = None
    cpu_usage: dict[str, float] | None = None
    memory_usage: dict[str, int] | None = None
    environment: dict[str, str] | None = None
