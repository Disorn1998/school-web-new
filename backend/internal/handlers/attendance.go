package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// CheckIn handles the attendance check-in process
func CheckIn(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	userID := int(user["id"].(float64))

	type CheckInInput struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	var input CheckInInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	today := time.Now().Format("2006-01-02")
	checkInTime := time.Now().Format("15:04:05")

	// 1. Prevent duplicate check-in today
	var existing models.Attendance
	if err := database.DB.Where("user_id = ? AND work_date = ?", userID, today).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Already checked in today"})
	}

	// 2. Calculate late minutes
	workStartTarget, _ := time.Parse("15:04:05", "08:30:00") // 08:30 Target
	actualTime, _ := time.Parse("15:04:05", checkInTime)

	status := "ontime"
	lateMinutes := 0

	if actualTime.After(workStartTarget) {
		status = "late"
		diff := actualTime.Sub(workStartTarget)
		lateMinutes = int(diff.Minutes())
	}

	ipAddress := c.IP()

	attendance := models.Attendance{
		UserID:      userID,
		WorkDate:    today,
		CheckIn:     checkInTime,
		Status:      status,
		LateMinutes: lateMinutes,
		IPAddress:   ipAddress,
		Latitude:    input.Latitude,
		Longitude:   input.Longitude,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record attendance"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Checked in successfully",
		"data":    attendance,
	})
}
