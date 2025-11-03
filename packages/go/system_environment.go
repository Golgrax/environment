package environment

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"runtime"
	"strings"
	"strconv"
)

type SystemEnvironment struct {
	Platform string
	EnvFile  string
}

func NewSystemEnvironment() *SystemEnvironment {
	platform := runtime.GOOS
	var envFile string
	if platform == "linux" || platform == "darwin" {
		envFile = "/etc/environment"
	} else {
		panic(fmt.Sprintf("SystemEnvironment is not implemented for %s", platform))
	}
	return &SystemEnvironment{Platform: platform, EnvFile: envFile}
}

func (se *SystemEnvironment) GetOS() string {
	return se.Platform
}

func (se *SystemEnvironment) GetCPU() (string, error) {
	if se.Platform == "linux" {
		file, err := os.Open("/proc/cpuinfo")
		if err != nil {
			return "", err
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "model name") {
				parts := strings.SplitN(line, ":", 2)
				if len(parts) > 1 {
					return strings.TrimSpace(parts[1]), nil
				}
			}
		}

		if err := scanner.Err(); err != nil {
			return "", err
		}
	}
	return "unknown", nil
}

func (se *SystemEnvironment) GetMemory() (uint64, error) {
	if se.Platform == "linux" {
		file, err := os.Open("/proc/meminfo")
		if err != nil {
			return 0, err
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "MemTotal") {
				parts := strings.Fields(line)
				if len(parts) >= 2 {
					mem, err := strconv.ParseUint(parts[1], 10, 64)
					if err == nil {
						return mem * 1024, nil
					}
				}
			}
		}

		if err := scanner.Err(); err != nil {
			return 0, err
		}
	}
	return 0, nil
}

func (se *SystemEnvironment) Get(name string) (string, error) {
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return "", err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, name+"=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				return strings.Trim(parts[1], `"`), nil
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return "", nil
}

func (se *SystemEnvironment) Set(name string, value string) error {
	// Note: This requires sudo permissions
	input, err := ioutil.ReadFile(se.EnvFile)
	if err != nil {
		return err
	}

	lines := strings.Split(string(input), "\n")
	found := false
	for i, line := range lines {
		if strings.HasPrefix(line, name+"=") {
			lines[i] = name + "=\"" + value + "\""
			found = true
			break
		}
	}

	if !found {
		lines = append(lines, name+"=\""+value+"\"")
	}

	output := strings.Join(lines, "\n")
	err = ioutil.WriteFile(se.EnvFile, []byte(output), 0644)
	if err != nil {
		return err
	}
	return nil
}

func (se *SystemEnvironment) Remove(name string) error {
	// Note: This requires sudo permissions
	input, err := ioutil.ReadFile(se.EnvFile)
	if err != nil {
		return err
	}

	lines := strings.Split(string(input), "\n")
	var outputLines []string
	for _, line := range lines {
		if !strings.HasPrefix(line, name+"=") {
			outputLines = append(outputLines, line)
		}
	}

	output := strings.Join(outputLines, "\n")
	err = ioutil.WriteFile(se.EnvFile, []byte(output), 0644)
	if err != nil {
		return err
	}
	return nil
}

func (se *SystemEnvironment) ListKeys() ([]string, error) {
	var keys []string
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "=") {
			keys = append(keys, strings.SplitN(line, "=", 2)[0])
		}
	}

	return keys, scanner.Err()
}

func (se *SystemEnvironment) ListValues() ([]string, error) {
	var values []string
	file, err := os.Open(se.EnvFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				values = append(values, strings.Trim(parts[1], `"`))
			}
		}
	}

	return values, scanner.Err()
}
