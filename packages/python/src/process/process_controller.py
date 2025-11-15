import subprocess
import os
import signal
from src.dataclasses.process import ProcessControllerOptions


class ProcessController:
    """A class to manage and control child processes"""

    def __init__(self):
        pass

    def start(
        self,
        command: list[str],
        options: ProcessControllerOptions | None,
    ) -> subprocess.Popen[str] | subprocess.Popen[bytes] | None:
        """Starts a process and returns the process as a Popen object"""
        return subprocess.Popen(
            command,
            shell=options.shell if options and options.shell else False,
            env=options.env if options and options.env else os.environ.copy(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=options.text if options and options.text else True,
        )

    def stop(
        self,
        process: subprocess.Popen[str] | subprocess.Popen[bytes],
        timeout: int = 5,
        signal: int = signal.SIGTERM,
    ) -> int | None:
        """Stop a process, returns error code if not successful"""
        try:
            process.send_signal(sig=signal)
        except subprocess.TimeoutExpired:
            code = process.wait(timeout=timeout)
            return code

    def restart(
        self,
        command: list[str],
        options: ProcessControllerOptions | None,
        old_process: subprocess.Popen[str] | subprocess.Popen[bytes],
    ) -> subprocess.Popen[str] | subprocess.Popen[bytes] | None:
        """Safely attempt to restart a process given a new command and options"""
        if self.is_running(old_process):
            # attempt to stop running process, and ensure process stops successfully
            if (code := self.stop(old_process)) is not None:
                raise subprocess.SubprocessError(
                    f"Failed to stop old process during process restart, code: {code}"
                )
        return self.start(command, options)

    def is_running(
        self, process: subprocess.Popen[str] | subprocess.Popen[bytes]
    ) -> bool:
        """Checks whether or not a process is running"""
        if process.poll() is None:  # poll returns None if the process isn't done yet
            return True
        return False
