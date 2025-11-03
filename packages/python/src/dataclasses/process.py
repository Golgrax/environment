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


class ProcessControllerOptionsProtocol(Protocol):
    """Contract for process controller options"""

    cwd: str | None
    env: dict[str, str] | None
    text: bool | None
    shell: bool | None
    detatched: bool | None
    restart_on_fail: bool | None
    auto_restart: bool | None
    maximum_restarts: int | None


@dataclass
class ProcessControllerOptions:
    """Encapsulate options for modular process control"""

    cwd: str | None = None
    env: dict[str, str] | None = None
    text: bool | None = True
    shell: bool | None = False
    detatched: bool | None = None
    restart_on_fail: bool | None = None
    auto_restart: bool | None = None
    maximum_restarts: int | None = None
