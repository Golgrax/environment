package environment

import (
	"os"
	"os/user"
)

func GetUserName() (string, error) {
	currentUser, err := user.Current()
	if err != nil {
		return "", err
	}
	return currentUser.Username, nil
}

func GetHomeDirectory() (string, error) {
	return os.UserHomeDir()
}
