package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetTeachers retrieves all admins with role 'teacher', including their profile
func GetTeachers(c *fiber.Ctx) error {
	var teachers []models.Admin

	result := database.DB.Preload("TeacherProfile").Where("role = ?", "teacher").Find(&teachers)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch teachers"})
	}

	return c.Status(fiber.StatusOK).JSON(teachers)
}

// GetStaff retrieves all admins with role 'officer' or 'super'
func GetStaff(c *fiber.Ctx) error {
	var staff []models.Admin

	result := database.DB.Where("role IN ?", []string{"officer", "super"}).Find(&staff)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch staff"})
	}

	return c.Status(fiber.StatusOK).JSON(staff)
}
