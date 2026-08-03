package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"fmt"
	"time"
)

// GetAllStudents returns all students with their parent information
func GetAllStudents(c *fiber.Ctx) error {
	var students []models.Student

	// Preload the Parent relationship
	if err := database.DB.Preload("Parent").Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	return c.JSON(students)
}

// GetStudent returns a single student by ID
func GetStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student

	if err := database.DB.Preload("Parent").First(&student, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found"})
	}

	return c.JSON(student)
}

// CreateStudent creates a new student
func CreateStudent(c *fiber.Ctx) error {
	var student models.Student

	if err := c.BodyParser(&student); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Auto-generate student_id if empty
	if student.StudentID == "" {
		var lastStudent models.Student
		database.DB.Order("id desc").First(&lastStudent)
		newId := 1
		if lastStudent.ID > 0 {
			newId = lastStudent.ID + 1
		}
		currentYear := time.Now().Year()
		student.StudentID = fmt.Sprintf("STU%d%04d", currentYear, newId)
	}

	if err := database.DB.Create(&student).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create student"})
	}

	return c.Status(fiber.StatusCreated).JSON(student)
}

// UpdateStudent updates an existing student
func UpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")
	var student models.Student

	if err := database.DB.First(&student, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Student not found"})
	}

	var updateData models.Student
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Model(&student).Updates(updateData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update student"})
	}

	return c.JSON(student)
}

// DeleteStudent removes a student
func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Delete(&models.Student{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete student"})
	}

	return c.JSON(fiber.Map{"message": "Student deleted successfully"})
}
