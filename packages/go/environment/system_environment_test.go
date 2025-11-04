package environment

import (
	"runtime"
	"testing"
)

func TestSystemEnvironment(t *testing.T) {
	se, err := NewSystemEnvironment()
	if err != nil {
		t.Fatalf("NewSystemEnvironment() failed: %v", err)
	}
	if se.Platform == "" {
		t.Error("Expected Platform to be set")
	}
}

func TestGetOS(t *testing.T) {
	se, err := NewSystemEnvironment()
	if err != nil {
		t.Fatalf("NewSystemEnvironment() failed: %v", err)
	}
	os := se.GetOS()
	if os != runtime.GOOS {
		t.Errorf("Expected OS to be %s, got %s", runtime.GOOS, os)
	}
}

func TestGetCPUModel(t *testing.T) {
	se, err := NewSystemEnvironment()
	if err != nil {
		t.Fatalf("NewSystemEnvironment() failed: %v", err)
	}
	cpu, err := se.GetCPUModel()
	if err != nil {
		t.Errorf("Error getting CPU model: %s", err)
	}
	if cpu == "unknown" {
		t.Errorf("Expected CPU to be a valid string, got %s", cpu)
	}
}

func TestGetTotalMemory(t *testing.T) {
	se, err := NewSystemEnvironment()
	if err != nil {
		t.Fatalf("NewSystemEnvironment() failed: %v", err)
	}
	memory, err := se.GetTotalMemory()
	if err != nil {
		t.Errorf("Error getting memory: %s", err)
	}
	if memory == 0 {
		t.Errorf("Expected Memory to be a valid value, got %d", memory)
	}
}

// Other tests for Get, Set, Remove, ListKeys, ListValues would go here
// but are omitted as they require a more complex setup or sudo permissions.
