package utils

import (
	"os"
	"strings"
)

// GetFileURL formats the relative file path into a full absolute URL based on environment configurations
func GetFileURL(path string) string {
	if path == "" {
		return ""
	}

	// If path is already a full URL
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}

	// Get base url from env
	baseURL := os.Getenv("STORAGE_BASE_URL")
	if baseURL != "" {
		// Clean slashes
		baseURL = strings.TrimRight(baseURL, "/")
		path = strings.TrimLeft(path, "/")
		return baseURL + "/" + path
	}

	// Fallback if no STORAGE_BASE_URL is defined (e.g. localhost)
	baseURL = "http://localhost:3000/uploads"
	path = strings.TrimLeft(path, "/")
	return baseURL + "/" + path
}
