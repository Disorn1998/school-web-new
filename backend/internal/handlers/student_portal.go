package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetMyProfile returns all students belonging to the logged-in parent
func GetMyProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	
	parentIDVal, ok := user["parent_id"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Parent ID not found in token"})
	}
	parentID := int(parentIDVal)

	var siblings []models.Student
	if err := database.DB.Preload("Parent").Preload("Year").Where("parent_id = ?", parentID).Find(&siblings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch profiles"})
	}

	return c.JSON(siblings)
}

// GetMyHomework returns homework assigned to a specific student's class
func GetMyHomework(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))
	parentID := int(user["parent_id"].(float64))

	// Allow switching student
	if queryID := c.QueryInt("student_id", 0); queryID != 0 {
		var count int64
		database.DB.Model(&models.Student{}).Where("id = ? AND parent_id = ?", queryID, parentID).Count(&count)
		if count > 0 {
			studentID = queryID
		}
	}

	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found"})
	}

	var homework []models.Homework
	if err := database.DB.Preload("Teacher").Preload("Subject").Where("year_id = ?", student.YearID).Find(&homework).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch homework"})
	}

	return c.JSON(homework)
}

