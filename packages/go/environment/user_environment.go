package environment

import (
	"bufio"
	"fmt"
	"os"
	"runtime"
	"strings"
)

// UserEnvironment provides an interface for managing user-level environment variables.
// It abstracts platform-specific details, such as shell configuration files
// (.bashrc, .zshrc) on Unix-like systems.
//
// Note: The current implementation primarily focuses on Linux/macOS by interacting
// with the user's .bashrc file. A more robust solution would detect the user's
// active shell and modify the appropriate configuration file.
type UserEnvironment struct{}

// Get retrieves a user-level environment variable by parsing the .bashrc file.
// It searches for lines starting with "export NAME=" and extracts the value.
// Returns an empty string if the variable is not found or an error occurs.
func (ue *UserEnvironment) Get(name string) (string, error) {
	// Get the current user's home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Construct the path to the .bashrc file.
	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return "", fmt.Errorf("failed to open .bashrc file %s: %w", bashrcPath, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// Look for lines like "export NAME=VALUE".
		if strings.HasPrefix(line, "export "+name+"=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				// Trim quotes from the value if present.
				return strings.Trim(parts[1], `"`), nil
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("error scanning .bashrc file %s: %w", bashrcPath, err)
	}

	return "", nil // Return empty string if not found
}

// Set adds or updates a user-level environment variable in the .bashrc file.
// It reads the file, updates the variable's line if it exists, or appends it if new.
// The file is then rewritten with the updated content.
func (ue *UserEnvironment) Set(name string, value string) error {
	// Get the current user's home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Construct the path to the .bashrc file.
	bashrcPath := home + "/.bashrc"
	file, err := os.OpenFile(bashrcPath, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return fmt.Errorf("failed to open .bashrc file %s: %w", bashrcPath, err)
	}
	defer file.Close()

	lines := []string{}
	scanner := bufio.NewScanner(file)
	found := false
	for scanner.Scan() {
		line := scanner.Text()
		// If the variable already exists, update its line.
		if strings.HasPrefix(line, "export "+name+"=") {
			lines = append(lines, "export "+name+"=\""+value+"\"")
			found = true
		} else {
			lines = append(lines, line)
		}
	}

	// If the variable was not found, append it to the end.
	if !found {
		lines = append(lines, "export "+name+"=\""+value+"\"")
	}

	// Check for scanner errors.
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error scanning .bashrc file %s: %w", bashrcPath, err)
	}

	// Rewrite the file with the updated content.
	file.Truncate(0)
	file.Seek(0, 0)
	writer := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(writer, line)
	}
	return writer.Flush()
}

// Remove deletes a user-level environment variable from the .bashrc file.
// It reads the file, filters out the specified variable, and rewrites the content.
func (ue *UserEnvironment) Remove(name string) error {
	// Get the current user's home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Construct the path to the .bashrc file.
	bashrcPath := home + "/.bashrc"
	file, err := os.OpenFile(bashrcPath, os.O_RDWR, 0644)
	if err != nil {
		return fmt.Errorf("failed to open .bashrc file %s: %w", bashrcPath, err)
	}
	defer file.Close()

	lines := []string{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// Keep all lines that do not start with the variable to be removed.
		if !strings.HasPrefix(line, "export "+name+"=") {
			lines = append(lines, line)
		}
	}

	// Check for scanner errors.
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error scanning .bashrc file %s: %w", bashrcPath, err)
	}

	// Rewrite the file with the updated content.
	file.Truncate(0)
	file.Seek(0, 0)
	writer := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(writer, line)
	}
	return writer.Flush()
}

// GetOS returns the operating system identifier (e.g., "linux", "windows", "darwin").
// This is a direct wrapper around runtime.GOOS.
func (ue *UserEnvironment) GetOS() string {
	return runtime.GOOS
}

// ListKeys returns a slice of all variable names from the .bashrc file.
// It parses each line starting with "export " and extracts the key before the '=' sign.
func (ue *UserEnvironment) ListKeys() ([]string, error) {
	var keys []string
	// Get the current user's home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		return keys, fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Construct the path to the .bashrc file.
	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return keys, fmt.Errorf("failed to open .bashrc file %s: %w", bashrcPath, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// Look for lines starting with "export ".
		if strings.HasPrefix(line, "export ") {
			parts := strings.SplitN(strings.TrimPrefix(line, "export "), "=", 2)
			// Add the key if it's a valid key-value pair.
			if len(parts) > 0 && len(parts[0]) > 0 {
				keys = append(keys, parts[0])
			}
		}
	}

	return keys, scanner.Err()
}

// ListValues returns a slice of all variable values from the .bashrc file.
// It parses each line starting with "export " and extracts the value after the '=' sign, trimming any quotes.
func (ue *UserEnvironment) ListValues() ([]string, error) {
	var values []string
	// Get the current user's home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		return values, fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Construct the path to the .bashrc file.
	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return values, fmt.Errorf("failed to open .bashrc file %s: %w", bashrcPath, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// Look for lines starting with "export ".
		if strings.HasPrefix(line, "export ") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				// Trim quotes from the value if present.
				values = append(values, strings.Trim(parts[1], `"`))
			}
		}
	}

	return values, scanner.Err()
}