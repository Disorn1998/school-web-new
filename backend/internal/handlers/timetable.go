package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetClassTimetable returns the timetable for a specific class year and semester
func GetClassTimetable(c *fiber.Ctx) error {
	yearID := c.Query("year_id")
	semesterID := c.Query("semester_id")

	if yearID == "" || semesterID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "year_id and semester_id are required"})
	}

	var timetables []models.Timetable
	if err := database.DB.Preload("Teacher").Where("year_id = ? AND semester_id = ?", yearID, semesterID).Find(&timetables).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch timetable"})
	}

	return c.JSON(timetables)
}

// SaveClassTimetable saves multiple periods at once
func SaveClassTimetable(c *fiber.Ctx) error {
	type TimetableInput struct {
		YearID     int                `json:"year_id"`
		SemesterID int                `json:"semester_id"`
		Entries    []models.Timetable `json:"entries"`
	}

	var input TimetableInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Begin Transaction
	tx := database.DB.Begin()

	// Clear existing timetable for this class and semester to rebuild
	if err := tx.Where("year_id = ? AND semester_id = ?", input.YearID, input.SemesterID).Delete(&models.Timetable{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clear old timetable"})
	}

	// Insert new entries
	for _, entry := range input.Entries {
		entry.YearID = input.YearID
		entry.SemesterID = input.SemesterID
		entry.ID = 0 // Ensure it creates new
		if err := tx.Create(&entry).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save timetable entry"})
		}
	}

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Timetable saved successfully"})
}

// GetTeacherTimetable returns the schedule for a specific teacher
func GetTeacherTimetable(c *fiber.Ctx) error {
	teacherID := c.Params("id")
	semesterID := c.Query("semester_id")

	if semesterID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "semester_id is required"})
	}

	var timetables []models.Timetable
	if err := database.DB.Where("teacher_id = ? AND semester_id = ?", teacherID, semesterID).Find(&timetables).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch teacher timetable"})
	}

	return c.JSON(timetables)
}
