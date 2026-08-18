package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetAllLeaveRequests returns leave requests for admin/teacher
func GetAllLeaveRequests(c *fiber.Ctx) error {
	status := c.Query("status")
	var leaves []models.StudentLeave

	query := database.DB.Preload("Student")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at desc").Find(&leaves).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch leave requests"})
	}

	return c.JSON(leaves)
}

// GetStudentLeaveRequests returns leave requests for a specific student
func GetStudentLeaveRequests(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var leaves []models.StudentLeave

	if err := database.DB.Preload("Student").Where("student_id = ?", studentID).Order("created_at desc").Find(&leaves).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch student leave requests"})
	}

	return c.JSON(leaves)
}

// SubmitLeaveRequest submits a new leave request (by parent/student)
func SubmitLeaveRequest(c *fiber.Ctx) error {
	var leave models.StudentLeave
	if err := c.BodyParser(&leave); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if leave.StudentID == 0 {
		user := c.Locals("user").(jwt.MapClaims)
		if user["role"] == "student" {
			leave.StudentID = int(user["id"].(float64))
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Student ID is required"})
		}
	}

	leave.Status = "PENDING"
	if err := database.DB.Create(&leave).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit leave request"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Leave request submitted successfully", "leave": leave})
}

// UpdateLeaveStatus updates the status of a leave request (Admin/Teacher)
func UpdateLeaveStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	type UpdateInput struct {
		Status string `json:"status"` // APPROVED, REJECTED
	}

	var input UpdateInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var leave models.StudentLeave
	if err := database.DB.First(&leave, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Leave request not found"})
	}

	leave.Status = input.Status
	if err := database.DB.Save(&leave).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update leave status"})
	}

	// Optionally: if approved, automatically insert an Attendance record marking them as "Leave"
	// but keeping it simple for now

	return c.JSON(fiber.Map{"message": "Leave request updated successfully", "leave": leave})
}
