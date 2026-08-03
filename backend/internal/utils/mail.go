package utils

import (
	"os"
)

// SMTPAccount represents an email account configuration
type SMTPAccount struct {
	Username string
	Password string
	FromName string
}

// GetSMTPAccount returns the configuration for the requested account type
// e.g. "info" or "parent"
func GetSMTPAccount(accountType string) SMTPAccount {
	switch accountType {
	case "info":
		user := os.Getenv("SMTP_INFO_USER")
		if user == "" {
			user = "info@stmarks.ac.th"
		}
		return SMTPAccount{
			Username: user,
			Password: os.Getenv("SMTP_INFO_PASS"),
			FromName: "ST.MARKS Info",
		}
	case "parent":
		user := os.Getenv("SMTP_PARENT_USER")
		if user == "" {
			user = "parent@stmarks.ac.th"
		}
		return SMTPAccount{
			Username: user,
			Password: os.Getenv("SMTP_PARENT_PASS"),
			FromName: "ST.MARKS Parent Relations",
		}
	default:
		// Default to main MAIL_USERNAME
		user := os.Getenv("MAIL_USERNAME")
		if user == "" {
			user = "tis@stmarks.ac.th"
		}
		return SMTPAccount{
			Username: user,
			Password: os.Getenv("MAIL_PASSWORD"),
			FromName: os.Getenv("MAIL_FROM"),
		}
	}
}
