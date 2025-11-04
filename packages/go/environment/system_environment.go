package environment

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"runtime"
	"strconv"
	"strings"
)

// SystemEnvironment provides an interface for interacting with system-level
// environment variables and system information. It abstracts platform-specific
// details for Windows, Linux, and macOS.
//
// Note: Write operations (Set, Remove) typically require elevated (admin/root)
// privileges on most operating systems to modify system-wide settings.
type SystemEnvironment struct {
	Platform string // The detected operating system platform (e.g., "linux", "windows", "darwin").
	EnvFile  string // The path to the system-wide environment file (e.g., /etc/environment on Linux).
}

// NewSystemEnvironment creates and returns a new SystemEnvironment instance.
// It automatically detects the current operating system and sets the appropriate
// environment file path. If the current platform is not supported, it returns an error.
func NewSystemEnvironment() (*SystemEnvironment, error) {
	platform := runtime.GOOS
	var envFile string

	// Determine the system-wide environment file based on the platform.
	// Currently supports Linux and macOS (darwin).
	if platform == "linux" || platform == "darwin" {
		envFile = "/etc/environment"
	} else {
		// For unsupported platforms, return an error.
		return nil, fmt.Errorf("SystemEnvironment is not implemented for %s", platform)
	}
	return &SystemEnvironment{Platform: platform, EnvFile: envFile}, nil
}

// GetOS returns the operating system identifier (e.g., "linux", "windows", "darwin").
// This is a direct wrapper around runtime.GOOS.
func (se *SystemEnvironment) GetOS() string {
	return se.Platform
}

// GetCPUModel returns the model name of the system's CPU.
// On Linux, it parses this information from /proc/cpuinfo.
// For other platforms, it returns "unknown" or an error if not implemented.
func (se *SystemEnvironment) GetCPUModel() (string, error) {
	if se.Platform == "linux" {
		// Open /proc/cpuinfo to read CPU details.
		file, err := os.Open("/proc/cpuinfo")
		if err != nil {
			return "", fmt.Errorf("failed to open /proc/cpuinfo: %w", err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			// Look for the "model name" line which contains the CPU model.
			if strings.HasPrefix(line, "model name") {
				parts := strings.SplitN(line, ":", 2)
				if len(parts) > 1 {
					return strings.TrimSpace(parts[1]), nil
				}
			}
		}

		if err := scanner.Err(); err != nil {
			return "", fmt.Errorf("error scanning /proc/cpuinfo: %w", err)
		}
		return "unknown", nil // If model name not found but no error.
	}
	// Placeholder for other platforms.
	return "unknown", fmt.Errorf("GetCPUModel is not implemented for %s", se.Platform)
}

// GetTotalMemory returns the total system memory in bytes.
// On Linux, it parses this information from /proc/meminfo.
// For other platforms, it returns 0 or an error if not implemented.
func (se *SystemEnvironment) GetTotalMemory() (uint64, error) {
	if se.Platform == "linux" {
		// Open /proc/meminfo to read memory details.
		file, err := os.Open("/proc/meminfo")
		if err != nil {
			return 0, fmt.Errorf("failed to open /proc/meminfo: %w", err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			// Look for the "MemTotal" line.
			if strings.HasPrefix(line, "MemTotal") {
				parts := strings.Fields(line)
				if len(parts) >= 2 {
					// The value is typically in KB, convert to bytes.
					mem, err := strconv.ParseUint(parts[1], 10, 64)
					if err == nil {
						return mem * 1024, nil
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			return 0, fmt.Errorf("error scanning /proc/meminfo: %w", err)
		}
		return 0, nil // If MemTotal not found but no error.
	}
	// Placeholder for other platforms.
	return 0, fmt.Errorf("GetTotalMemory is not implemented for %s", se.Platform)
}

// Get retrieves the value of a system environment variable from the environment file.
// On Linux/macOS, it reads from the file specified by EnvFile (e.g., /etc/environment).
// It returns an empty string if the variable is not found or an error occurs.
func (se *SystemEnvironment) Get(name string) (string, error) {
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return "", fmt.Errorf("failed to open environment file %s: %w", se.EnvFile, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// Look for lines starting with the variable name followed by '='.
		if strings.HasPrefix(line, name+"=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				// Trim quotes from the value if present.
				return strings.Trim(parts[1], `"`), nil
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("error scanning environment file %s: %w", se.EnvFile, err)
	}

	return "", nil // Return empty string if not found
}

// Set adds or updates a system environment variable in the environment file.
// This operation requires elevated (admin/root) privileges.
// It reads the file, updates the variable, and writes the content back.
func (se *SystemEnvironment) Set(name string, value string) error {
	// Read the current content of the environment file.
	input, err := ioutil.ReadFile(se.EnvFile)
	if err != nil {
		return fmt.Errorf("failed to read environment file %s: %w", se.EnvFile, err)
	}

	lines := strings.Split(string(input), "\n")
	found := false
	for i, line := range lines {
		// If the variable already exists, update its line.
		if strings.HasPrefix(line, name+"=") {
			lines[i] = name + "=\"" + value + "\""
			found = true
			break
		}
	}

	// If the variable was not found, append it to the end.
	if !found {
		lines = append(lines, name+"=\""+value+"\"")
	}

	// Write the modified content back to the file.
	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(se.EnvFile, []byte(output), 0644)
	if err != nil {
		return fmt.Errorf("failed to write to environment file %s: %w", se.EnvFile, err)
	}
	return nil
}

// Remove deletes a system environment variable from the environment file.
// This operation requires elevated (admin/root) privileges.
// It reads the file, filters out the specified variable, and writes the content back.
func (se *SystemEnvironment) Remove(name string) error {
	// Read the current content of the environment file.
	input, err := ioutil.ReadFile(se.EnvFile)
	if err != nil {
		return fmt.Errorf("failed to read environment file %s: %w", se.EnvFile, err)
	}

	lines := strings.Split(string(input), "\n")
	var outputLines []string
	for _, line := range lines {
		// Keep all lines that do not start with the variable name.
		if !strings.HasPrefix(line, name+"=") {
			outputLines = append(outputLines, line)
		}
	}

	// Write the modified content back to the file.
	output := strings.Join(outputLines, "\n")
	err = ioutil.WriteFile(se.EnvFile, []byte(output), 0644)
	if err != nil {
		return fmt.Errorf("failed to write to environment file %s: %w", se.EnvFile, err)
	}
	return nil
}

// ListKeys returns a slice of all variable names found in the environment file.
// It parses each line and extracts the key before the '=' sign.
func (se *SystemEnvironment) ListKeys() ([]string, error) {
	var keys []string
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open environment file %s: %w", se.EnvFile, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// If the line contains an '=', assume it's a key-value pair.
		if strings.Contains(line, "=") {
			keys = append(keys, strings.SplitN(line, "=", 2)[0])
		}
	}

	return keys, scanner.Err()
}

// ListValues returns a slice of all variable values found in the environment file.
// It parses each line and extracts the value after the '=' sign, trimming any quotes.
func (se *SystemEnvironment) ListValues() ([]string, error) {
	var values []string
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open environment file %s: %w", se.EnvFile, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		// If the line contains an '=', assume it's a key-value pair.
		if strings.Contains(line, "=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				// Trim quotes from the value if present.
				values = append(values, strings.Trim(parts[1], `"`))
			}
		}
	}

	return values, scanner.Err()
}
