package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetMyProfile returns the logged-in student's profile along with parent data
func GetMyProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))

	var student models.Student
	if err := database.DB.Preload("Parent").First(&student, studentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Profile not found"})
	}

	return c.JSON(student)
}

// GetMyHomework returns homework assigned to the logged-in student's class (year)
func GetMyHomework(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))

	// First find the student to know their YearID
	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found"})
	}

	var homework []models.Homework
	// Fetch homework for this student's specific YearID
	if err := database.DB.Preload("Teacher").Preload("Subject").Where("year_id = ?", student.YearID).Find(&homework).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch homework"})
	}

	return c.JSON(homework)
}

// GetMyInvoices returns invoices and receipts belonging to the logged-in student
func GetMyInvoices(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))

	var invoices []models.Invoice
	if err := database.DB.Preload("Semester").Preload("Items").Where("student_id = ?", studentID).Find(&invoices).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch invoices"})
	}

	return c.JSON(invoices)
}
