package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetAllSupportClasses returns all available support classes
func GetAllSupportClasses(c *fiber.Ctx) error {
	var classes []models.SupportClass
	if err := database.DB.Preload("Enrollments.Student").Find(&classes).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch support classes"})
	}
	return c.JSON(classes)
}

// CreateSupportClass creates a new support class (Admin only)
func CreateSupportClass(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	if user["role"] == "student" || user["role"] == "parent" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.SupportClass
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create support class"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

// EnrollSupportClass allows a student to enroll in a support class
func EnrollSupportClass(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)

	var req struct {
		ClassID   int `json:"class_id"`
		StudentID int `json:"student_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	studentID := req.StudentID
	if role == "student" {
		studentID = int(user["id"].(float64))
	} else if studentID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "student_id is required"})
	}

	// Check capacity
	var class models.SupportClass
	if err := database.DB.Preload("Enrollments").First(&class, req.ClassID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Class not found"})
	}

	if len(class.Enrollments) >= class.Capacity {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Class is fully booked"})
	}

	// Check if already enrolled
	var existing models.ClassEnrollment
	err := database.DB.Where("student_id = ? AND support_class_id = ?", studentID, req.ClassID).First(&existing).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Student is already enrolled in this class"})
	}

	enrollment := models.ClassEnrollment{
		StudentID:      studentID,
		SupportClassID: req.ClassID,
		Status:         "Pending Payment",
	}

	if err := database.DB.Create(&enrollment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to enroll"})
	}

	return c.Status(fiber.StatusCreated).JSON(enrollment)
}

// GetStudentSupportClasses returns classes enrolled by a specific student
func GetStudentSupportClasses(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))

	// If parent is viewing, they might send student_id query param
	if c.Query("student_id") != "" && user["role"] == "parent" {
		parsed, _ := strconv.Atoi(c.Query("student_id"))
		studentID = parsed
	}

	var enrollments []models.ClassEnrollment
	if err := database.DB.Preload("SupportClass").Where("student_id = ?", studentID).Find(&enrollments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch enrollments"})
	}

	return c.JSON(enrollments)
}
