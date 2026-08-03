package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetAllHomework returns all homework assignments
func GetAllHomework(c *fiber.Ctx) error {
	var homework []models.Homework

	// Preload relationships (Teacher, Year, Subject)
	if err := database.DB.Preload("Teacher").Preload("Year").Preload("Subject").Find(&homework).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch homework"})
	}

	return c.JSON(homework)
}

// CreateHomework adds a new homework assignment
func CreateHomework(c *fiber.Ctx) error {
	var hw models.Homework

	if err := c.BodyParser(&hw); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Create(&hw).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create homework"})
	}

	return c.Status(fiber.StatusCreated).JSON(hw)
}

// UpdateHomework modifies an existing homework
func UpdateHomework(c *fiber.Ctx) error {
	id := c.Params("id")
	var hw models.Homework

	if err := database.DB.First(&hw, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Homework not found"})
	}

	var updateData models.Homework
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Model(&hw).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update homework"})
	}

	return c.JSON(hw)
}

// DeleteHomework removes a homework assignment
func DeleteHomework(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Delete(&models.Homework{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete homework"})
	}

	return c.JSON(fiber.Map{"message": "Homework deleted successfully"})
}
