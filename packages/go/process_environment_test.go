package environment_test

import (
	"os"
	"os/user"
	"testing"

	"github.com/octovel/environment/go/environment"
)

func TestGetUserName(t *testing.T) {
	username, err := environment.GetUserName()
	if err != nil {
		t.Errorf("Error getting username: %s", err)
	}

	currentUser, err := user.Current()
	if err != nil {
		t.Errorf("Error getting current user: %s", err)
	}

	if username != currentUser.Username {
		t.Errorf("Expected username to be %s, got %s", currentUser.Username, username)
	}
}

func TestGetHomeDirectory(t *testing.T) {
	home, err := environment.GetHomeDirectory()
	if err != nil {
		t.Errorf("Error getting home directory: %s", err)
	}

	userHome, err := os.UserHomeDir()
	if err != nil {
		t.Errorf("Error getting user home dir: %s", err)
	}

	if home != userHome {
		t.Errorf("Expected home directory to be %s, got %s", userHome, home)
	}
}
