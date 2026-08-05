package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetAdminDuties fetches all data needed for Duty Management (Teachers, Days, Slots, Areas, Assignments)
func GetAdminDuties(c *fiber.Ctx) error {
	var teachers []models.Admin
	if err := database.DB.Where("role = ?", "teacher").Find(&teachers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch teachers"})
	}

	var days []models.DutyDay
	database.DB.Order("sort_order ASC").Find(&days)

	var slots []models.DutyTimeSlot
	database.DB.Order("sort_order ASC").Find(&slots)

	var areas []models.DutyArea
	database.DB.Find(&areas)

	var assignments []models.DutyAssignment
	database.DB.Preload("Teacher").Preload("Day").Preload("TimeSlot").Preload("Area").Find(&assignments)

	return c.JSON(fiber.Map{
		"teachers":    teachers,
		"days":        days,
		"time_slots":  slots,
		"areas":       areas,
		"assignments": assignments,
	})
}

// AssignDuty creates a new duty assignment
func AssignDuty(c *fiber.Ctx) error {
	var input struct {
		TeacherID  int `json:"teacher_id"`
		DayID      int `json:"day_id"`
		TimeSlotID int `json:"time_slot_id"`
		AreaID     int `json:"area_id"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.TeacherID == 0 || input.DayID == 0 || input.TimeSlotID == 0 || input.AreaID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required fields"})
	}

	assignment := models.DutyAssignment{
		TeacherID:  input.TeacherID,
		DayID:      input.DayID,
		TimeSlotID: input.TimeSlotID,
		AreaID:     input.AreaID,
	}

	if err := database.DB.Create(&assignment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to assign duty"})
	}

	// Fetch full assigned record for frontend
	database.DB.Preload("Teacher").Preload("Day").Preload("TimeSlot").Preload("Area").First(&assignment, assignment.ID)

	return c.JSON(fiber.Map{
		"message":    "Duty assigned successfully",
		"assignment": assignment,
	})
}

// DeleteDuty deletes a duty assignment
func DeleteDuty(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Delete(&models.DutyAssignment{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete duty"})
	}

	return c.JSON(fiber.Map{"message": "Duty deleted successfully"})
}

// CreateDutyMetaData seeds/creates Days, Slots, Areas if they don't exist
func InitDutyMetaData() {
	var count int64
	database.DB.Model(&models.DutyDay{}).Count(&count)
	if count == 0 {
		days := []models.DutyDay{
			{Name: "Monday", SortOrder: 1},
			{Name: "Tuesday", SortOrder: 2},
			{Name: "Wednesday", SortOrder: 3},
			{Name: "Thursday", SortOrder: 4},
			{Name: "Friday", SortOrder: 5},
		}
		database.DB.Create(&days)
	}

	database.DB.Model(&models.DutyTimeSlot{}).Count(&count)
	if count == 0 {
		slots := []models.DutyTimeSlot{
			{Name: "Morning (07:00 - 08:00)", SortOrder: 1},
			{Name: "Break (10:00 - 10:30)", SortOrder: 2},
			{Name: "Lunch (12:00 - 13:00)", SortOrder: 3},
			{Name: "After School (15:30 - 16:30)", SortOrder: 4},
		}
		database.DB.Create(&slots)
	}

	database.DB.Model(&models.DutyArea{}).Count(&count)
	if count == 0 {
		areas := []models.DutyArea{
			{Name: "Gate 1 (Main Entrance)"},
			{Name: "Gate 2 (Back Entrance)"},
			{Name: "Playground"},
			{Name: "Canteen"},
			{Name: "Library"},
		}
		database.DB.Create(&areas)
	}
}
