package environment

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"

)

func TestUserEnvironment(t *testing.T) {
	// Create a temporary directory to act as the home directory
	tmpDir, err := ioutil.TempDir("", "test-home")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create a .bashrc file inside the temporary directory
	tmpfile, err := os.Create(filepath.Join(tmpDir, ".bashrc"))
	if err != nil {
		t.Fatal(err)
	}
	tmpfile.Close()

	// Set the HOME variable to the temporary directory
	originalHome := os.Getenv("HOME")
	os.Setenv("HOME", tmpDir)
	defer os.Setenv("HOME", originalHome)

	ue := UserEnvironment{}

	// Test Set
	err = ue.Set("TEST_VAR", "test_value")
	if err != nil {
		t.Errorf("Error setting variable: %s", err)
	}

	// Test Get
	val, err := ue.Get("TEST_VAR")
	if err != nil {
		t.Errorf("Error getting variable: %s", err)
	}
	if val != "test_value" {
		t.Errorf("Expected value to be 'test_value', got '%s'", val)
	}

	// Test ListKeys
	keys, err := ue.ListKeys()
	if err != nil {
		t.Errorf("Error listing keys: %s", err)
	}
	if len(keys) != 1 || keys[0] != "TEST_VAR" {
		t.Errorf("Expected keys to be ['TEST_VAR'], got %v", keys)
	}

	// Test ListValues
	values, err := ue.ListValues()
	if err != nil {
		t.Errorf("Error listing values: %s", err)
	}
	if len(values) != 1 || values[0] != "test_value" {
		t.Errorf("Expected values to be ['test_value'], got %v", values)
	}

	// Test Remove
	err = ue.Remove("TEST_VAR")
	if err != nil {
		t.Errorf("Error removing variable: %s", err)
	}

	// Verify removal
	val, err = ue.Get("TEST_VAR")
	if err != nil {
		t.Errorf("Error getting variable after removal: %s", err)
	}
	if val != "" {
		t.Errorf("Expected value to be empty after removal, got '%s'", val)
	}
}