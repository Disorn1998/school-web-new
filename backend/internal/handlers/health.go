package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// --- Health Records (BMI, Allergies) ---

func GetStudentHealthRecord(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var record models.HealthRecord
	if err := database.DB.Where("student_id = ?", studentID).First(&record).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Record not found"})
	}
	return c.JSON(record)
}

func UpsertHealthRecord(c *fiber.Ctx) error {
	var req models.HealthRecord
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var existing models.HealthRecord
	if err := database.DB.Where("student_id = ?", req.StudentID).First(&existing).Error; err == nil {
		// Update
		req.ID = existing.ID
		database.DB.Save(&req)
	} else {
		// Create
		database.DB.Create(&req)
	}
	
	return c.JSON(req)
}

// --- Health Incidents (Accidents/Sickness) ---

func GetStudentHealthIncidents(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var incidents []models.HealthIncident
	if err := database.DB.Preload("Reporter").Where("student_id = ?", studentID).Order("incident_date desc").Find(&incidents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch incidents"})
	}
	return c.JSON(incidents)
}

func GetAllHealthIncidents(c *fiber.Ctx) error {
	var incidents []models.HealthIncident
	if err := database.DB.Preload("Student").Preload("Reporter").Order("incident_date desc").Find(&incidents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch incidents"})
	}
	return c.JSON(incidents)
}

func CreateHealthIncident(c *fiber.Ctx) error {
	var req models.HealthIncident
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Get reporter ID from token
	user := c.Locals("user").(jwt.MapClaims)
	if user["role"] == "student" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only staff can log incidents"})
	}
	req.ReporterID = int(user["id"].(float64))

	if req.IncidentDate == "" {
		req.IncidentDate = time.Now().Format("2006-01-02")
	}

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record incident"})
	}
	
	return c.Status(fiber.StatusCreated).JSON(req)
}
