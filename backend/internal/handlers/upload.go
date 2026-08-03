package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

// UploadImage handles file uploads for student profiles
func UploadImage(c *fiber.Ctx) error {
	// Parse the multipart form
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse image file"})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	// Ensure directory exists
	uploadDir := "./uploads/profiles"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create directory"})
	}

	// Save file to the disk
	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save image"})
	}

	// Return the relative URL so frontend can load it
	imageUrl := fmt.Sprintf("/uploads/profiles/%s", filename)
	return c.JSON(fiber.Map{
		"url": imageUrl,
	})
}
