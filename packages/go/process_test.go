package environment

import (
	"os"
	"reflect"
	"testing"
)

func TestGetProcessId(t *testing.T) {
	pid := GetProcessId()
	if pid != os.Getpid() {
		t.Errorf("Expected pid to be %d, got %d", os.Getpid(), pid)
	}
}

func TestGetCommandLineArguments(t *testing.T) {
	args := GetCommandLineArguments()
	if !reflect.DeepEqual(args, os.Args) {
		t.Errorf("Expected args to be %v, got %v", os.Args, args)
	}
}
