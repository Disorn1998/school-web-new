package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"fmt"
	"time"
)

// GetAllParents returns all parents with their linked students
func GetAllParents(c *fiber.Ctx) error {
	var parents []models.Parent

	// Preload Students relationship
	if err := database.DB.Preload("Students").Find(&parents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch parents"})
	}

	return c.JSON(parents)
}

// GetParent returns a single parent by ID
func GetParent(c *fiber.Ctx) error {
	id := c.Params("id")
	var parent models.Parent

	if err := database.DB.Preload("Students").First(&parent, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Parent not found"})
	}

	return c.JSON(parent)
}

// CreateParent creates a new parent account
func CreateParent(c *fiber.Ctx) error {
	type ParentInput struct {
		models.Parent
		Password string `json:"password"` // Allow setting password on creation
	}

	var input ParentInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Hash password if provided
	if input.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
		}
		input.Parent.Password = string(hash)
	}

	// Auto-generate username if empty
	if input.Parent.Username == "" {
		var lastParent models.Parent
		database.DB.Order("id desc").First(&lastParent)
		newId := 1
		if lastParent.ID > 0 {
			newId = lastParent.ID + 1
		}
		currentYear := time.Now().Year()
		input.Parent.Username = fmt.Sprintf("PRT%d%04d", currentYear, newId)
	}

	if err := database.DB.Create(&input.Parent).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create parent"})
	}

	return c.Status(fiber.StatusCreated).JSON(input.Parent)
}

// UpdateParent updates parent information
func UpdateParent(c *fiber.Ctx) error {
	id := c.Params("id")
	var parent models.Parent

	if err := database.DB.First(&parent, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Parent not found"})
	}

	var updateData models.Parent
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Model(&parent).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update parent"})
	}

	return c.JSON(parent)
}

// DeleteParent removes a parent
func DeleteParent(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Delete(&models.Parent{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete parent"})
	}

	return c.JSON(fiber.Map{"message": "Parent deleted successfully"})
}
