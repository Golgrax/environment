package environment

import (
	"runtime"
	"testing"
)

func TestSystemEnvironment(t *testing.T) {
	se := NewSystemEnvironment()
	if se.Platform == "" {
		t.Error("Expected Platform to be set")
	}
}

func TestGetOS(t *testing.T) {
	se := NewSystemEnvironment()
	os := se.GetOS()
	if os != runtime.GOOS {
		t.Errorf("Expected OS to be %s, got %s", runtime.GOOS, os)
	}
}

func TestGetCPU(t *testing.T) {
	se := NewSystemEnvironment()
	cpu, err := se.GetCPU()
	if err != nil {
		t.Errorf("Error getting CPU: %s", err)
	}
	if cpu == "unknown" {
		t.Errorf("Expected CPU to be a valid string, got %s", cpu)
	}
}

func TestGetMemory(t *testing.T) {
	se := NewSystemEnvironment()
	memory, err := se.GetMemory()
	if err != nil {
		t.Errorf("Error getting memory: %s", err)
	}
	if memory == 0 {
		t.Errorf("Expected Memory to be a valid value, got %d", memory)
	}
}

func TestGet(t *testing.T) {
	se := NewSystemEnvironment()
	// This test assumes a common environment variable like PATH exists
	val, err := se.Get("PATH")
	if err != nil {
		t.Errorf("Error getting PATH: %s", err)
	}
	if val == "" {
		t.Error("Expected PATH to have a value")
	}
}

func TestListKeys(t *testing.T) {
	se := NewSystemEnvironment()
	keys, err := se.ListKeys()
	if err != nil {
		t.Errorf("Error listing keys: %s", err)
	}
	if len(keys) == 0 {
		t.Error("Expected some keys to be listed")
	}
	if !contains(keys, "PATH") {
		t.Error("Expected PATH to be in the list of keys")
	}
}

func TestListValues(t *testing.T) {
	se := NewSystemEnvironment()
	values, err := se.ListValues()
	if err != nil {
		t.Errorf("Error listing values: %s", err)
	}
	if len(values) == 0 {
		t.Error("Expected some values to be listed")
	}
}

// The 'Set' and 'Remove' methods are not tested as they require sudo permissions.

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
