package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetAllECAs returns all ECAs for a semester
func GetAllECAs(c *fiber.Ctx) error {
	semesterID := c.Query("semester_id")

	var ecas []models.ECA
	query := database.DB.Preload("Teacher")
	if semesterID != "" {
		query = query.Where("semester_id = ?", semesterID)
	}

	if err := query.Find(&ecas).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch ECAs"})
	}

	return c.JSON(ecas)
}

// CreateECA creates a new ECA
func CreateECA(c *fiber.Ctx) error {
	var eca models.ECA
	if err := c.BodyParser(&eca); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Create(&eca).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create ECA"})
	}

	return c.Status(fiber.StatusCreated).JSON(eca)
}

// GetStudentECAs returns ECAs a student is enrolled in
func GetStudentECAs(c *fiber.Ctx) error {
	studentID := c.Params("id")
	semesterID := c.Query("semester_id")

	var enrollments []models.ECAEnrollment
	query := database.DB.Preload("ECA").Preload("ECA.Teacher").Where("student_id = ?", studentID)
	
	if semesterID != "" {
		// Join to filter by ECA's semester
		query = query.Joins("JOIN ecas ON eca_enrollments.eca_id = ecas.id").Where("ecas.semester_id = ?", semesterID)
	}

	if err := query.Find(&enrollments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch enrollments"})
	}

	return c.JSON(enrollments)
}

// EnrollStudentECA enrolls a student in an ECA
func EnrollStudentECA(c *fiber.Ctx) error {
	type EnrollInput struct {
		ECAID     int `json:"eca_id"`
		StudentID int `json:"student_id"`
	}

	// Determine student ID. Could be from body (Admin) or token (Parent/Student)
	var input EnrollInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// If StudentID is 0, fetch from token
	if input.StudentID == 0 {
		user := c.Locals("user").(jwt.MapClaims)
		if user["role"] == "student" {
			input.StudentID = int(user["id"].(float64))
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Student ID required"})
		}
	}

	// Check ECA capacity
	var eca models.ECA
	if err := database.DB.First(&eca, input.ECAID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "ECA not found"})
	}

	var currentCount int64
	database.DB.Model(&models.ECAEnrollment{}).Where("eca_id = ? AND status = ?", input.ECAID, "Enrolled").Count(&currentCount)

	if currentCount >= int64(eca.MaxCapacity) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "ECA is full"})
	}

	enrollment := models.ECAEnrollment{
		ECAID:     input.ECAID,
		StudentID: input.StudentID,
		Status:    "Enrolled",
	}

	if err := database.DB.Create(&enrollment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to enroll or already enrolled"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Enrolled successfully", "enrollment": enrollment})
}
