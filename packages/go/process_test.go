package environment_test

import (
	"os"
	"reflect"
	"testing"

	"github.com/octovel/environment/go/environment"
)

func TestGetProcessId(t *testing.T) {
	pid := environment.GetProcessId()
	if pid != os.Getpid() {
		t.Errorf("Expected pid to be %d, got %d", os.Getpid(), pid)
	}
}

func TestGetCommandLineArguments(t *testing.T) {
	args := environment.GetCommandLineArguments()
	if !reflect.DeepEqual(args, os.Args) {
		t.Errorf("Expected args to be %v, got %v", os.Args, args)
	}
}
