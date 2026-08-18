package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Public Form: Submit Application
func SubmitAdmission(c *fiber.Ctx) error {
	var req models.AdmissionApplication
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	count := int64(0)
	database.DB.Model(&models.AdmissionApplication{}).Count(&count)
	req.ApplicationNo = fmt.Sprintf("APP-%s-%04d", time.Now().Format("2006"), count+1)
	req.Status = "Pending"

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to submit application"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

// Admin: Get all applications
func GetAllAdmissions(c *fiber.Ctx) error {
	var applications []models.AdmissionApplication
	if err := database.DB.Order("created_at desc").Find(&applications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch applications"})
	}
	return c.JSON(applications)
}

// Admin: Update Status
func UpdateAdmissionStatus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var app models.AdmissionApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Application not found"})
	}

	app.Status = req.Status
	if err := database.DB.Save(&app).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update status"})
	}

	return c.JSON(app)
}

// Admin: Convert to Student (When Accepted)
func ConvertToStudent(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var app models.AdmissionApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Application not found"})
	}

	if app.Status != "Accepted" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Application must be accepted first"})
	}

	// Create Parent First (Because Student needs ParentID)
	parentUsername := fmt.Sprintf("p_%d", time.Now().Unix())
	parent := models.Parent{
		Username:        parentUsername,
		FatherFirstname: app.ParentName,
		FatherEmail:     app.ParentEmail,
		FatherPhone:     app.ParentPhone,
		Status:          "active",
	}

	tx := database.DB.Begin()

	if err := tx.Create(&parent).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create parent account"})
	}

	// Create Student
	count := int64(0)
	tx.Model(&models.Student{}).Count(&count)
	newStudentID := fmt.Sprintf("ST-%s-%03d", time.Now().Format("2006"), count+1)

	student := models.Student{
		StudentID: newStudentID,
		Fullname:  app.StudentFirstName + " " + app.StudentLastName,
		Status:    "active",
		ParentID:  parent.ID,
		YearID:    1, // Default to first year for now
	}

	if err := tx.Create(&student).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create student"})
	}

	// Update Application
	app.Status = "Registered"
	if err := tx.Save(&app).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update application"})
	}

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Converted successfully", "student": student})
}
