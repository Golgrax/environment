package environment

import (
	"bufio"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
)

type UserEnvironment struct{}

func (ue *UserEnvironment) Get(name string) (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "export "+name+"=") {
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

func (ue *UserEnvironment) Set(name string, value string) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	bashrcPath := home + "/.bashrc"
	file, err := os.OpenFile(bashrcPath, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	lines := []string{}
	scanner := bufio.NewScanner(file)
	found := false
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "export "+name+"=") {
			lines = append(lines, "export "+name+"=\""+value+"\"")
			found = true
		} else {
			lines = append(lines, line)
		}
	}

	if !found {
		lines = append(lines, "export "+name+"=\""+value+"\"")
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	file.Truncate(0)
	file.Seek(0, 0)
	writer := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(writer, line)
	}
	return writer.Flush()
}

func (ue *UserEnvironment) Remove(name string) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	bashrcPath := home + "/.bashrc"
	file, err := os.OpenFile(bashrcPath, os.O_RDWR, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	lines := []string{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "export "+name+"=") {
			lines = append(lines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	file.Truncate(0)
	file.Seek(0, 0)
	writer := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(writer, line)
	}
	return writer.Flush()
}

func (ue *UserEnvironment) GetOS() string {
	return runtime.GOOS
}

func (ue *UserEnvironment) GetCPU() (string, error) {
	if runtime.GOOS == "linux" {
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

func (ue *UserEnvironment) GetMemory() (uint64, error) {
	if runtime.GOOS == "linux" {
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

func (ue *UserEnvironment) ListKeys() ([]string, error) {
	keys := []string{}
	home, err := os.UserHomeDir()
	if err != nil {
		return keys, err
	}

	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return keys, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "export ") {
			parts := strings.SplitN(strings.TrimPrefix(line, "export "), "=", 2)
			keys = append(keys, parts[0])
		}
	}

	if err := scanner.Err(); err != nil {
		return keys, err
	}

	return keys, nil
}

func (ue *UserEnvironment) ListValues() ([]string, error) {
	values := []string{}
	home, err := os.UserHomeDir()
	if err != nil {
		return values, err
	}

	bashrcPath := home + "/.bashrc"
	file, err := os.Open(bashrcPath)
	if err != nil {
		return values, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "export ") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				values = append(values, strings.Trim(parts[1], `"`))
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return values, err
	}

	return values, nil
}