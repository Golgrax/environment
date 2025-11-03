package environment

import (
	"os"
)

func GetProcessId() int {
	return os.Getpid()
}

func GetCommandLineArguments() []string {
	return os.Args
}
