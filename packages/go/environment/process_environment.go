package environment

import (
	"fmt"
	"os"
	"os/user"
) 

// GetUserName returns the username of the current user.
// It retrieves this information from the operating system.
func GetUserName() (string, error) {
	currentUser, err := user.Current()
	if err != nil {
		// Return an error if the current user information cannot be retrieved.
		return "", fmt.Errorf("failed to get current user: %w", err)
	}
	return currentUser.Username, nil
}

// GetHomeDirectory returns the home directory path of the current user.
// It retrieves this information from the operating system.
func GetHomeDirectory() (string, error) {
	// os.UserHomeDir() provides a cross-platform way to get the user's home directory.
	return os.UserHomeDir()
}
