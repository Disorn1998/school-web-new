package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GetStudentEvaluations(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var evaluations []models.MonthlyEvaluation
	
	if err := database.DB.Preload("Teacher").Where("student_id = ?", studentID).Order("month_year desc").Find(&evaluations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch evaluations"})
	}
	return c.JSON(evaluations)
}

func GetAllEvaluations(c *fiber.Ctx) error {
	var evaluations []models.MonthlyEvaluation
	if err := database.DB.Preload("Student").Preload("Teacher").Order("month_year desc").Find(&evaluations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch evaluations"})
	}
	return c.JSON(evaluations)
}

func CreateEvaluation(c *fiber.Ctx) error {
	var req models.MonthlyEvaluation
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	user := c.Locals("user").(jwt.MapClaims)
	if user["role"] == "student" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only staff can evaluate students"})
	}
	req.TeacherID = int(user["id"].(float64))

	// Check if already evaluated for this month
	var existing models.MonthlyEvaluation
	if err := database.DB.Where("student_id = ? AND month_year = ?", req.StudentID, req.MonthYear).First(&existing).Error; err == nil {
		// Update existing
		req.ID = existing.ID
		database.DB.Save(&req)
		return c.JSON(req)
	}

	// Create new
	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create evaluation"})
	}
	
	return c.Status(fiber.StatusCreated).JSON(req)
}
