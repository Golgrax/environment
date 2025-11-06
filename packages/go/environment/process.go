package environment

import (
	"os"
)

// GetProcessId returns the process ID (PID) of the current running process.
// This is a direct wrapper around os.Getpid().
func GetProcessId() int {
	return os.Getpid()
}

// GetCommandLineArguments returns a slice of strings representing the command-line arguments
// with which the current process was started. The first element is the path to the executable.
// This is a direct wrapper around os.Args.
func GetCommandLineArguments() []string {
	return os.Args
}
