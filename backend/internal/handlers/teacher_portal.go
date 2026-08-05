package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetTeacherDashboard fetches My Duty and Student Leave Today
func GetTeacherDashboard(c *fiber.Ctx) error {
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	teacherID := int(claims["id"].(float64))

	// Fetch My Duty for this teacher
	var duties []models.DutyAssignment
	database.DB.Preload("Day").Preload("TimeSlot").Preload("Area").
		Where("teacher_id = ?", teacherID).
		Joins("JOIN duty_days ON duty_assignments.day_id = duty_days.id").
		Joins("JOIN duty_time_slots ON duty_assignments.time_slot_id = duty_time_slots.id").
		Order("duty_days.sort_order ASC, duty_time_slots.sort_order ASC").
		Find(&duties)

	// Fetch Student Leave Today
	today := time.Now().Format("2006-01-02")
	var leaves []models.StudentLeave
	// We want leaves where start_date <= today AND end_date >= today
	database.DB.Preload("Student").Preload("Student.Year").
		Where("start_date <= ? AND end_date >= ?", today, today).
		Find(&leaves)

	// Format duties for ribbon UI grouping by Day
	groupedDuties := make(map[string][]fiber.Map)
	for _, duty := range duties {
		if duty.Day != nil && duty.TimeSlot != nil && duty.Area != nil {
			dayName := duty.Day.Name
			groupedDuties[dayName] = append(groupedDuties[dayName], fiber.Map{
				"time_slot": duty.TimeSlot.Name,
				"area":      duty.Area.Name,
			})
		}
	}

	return c.JSON(fiber.Map{
		"my_duty":       groupedDuties,
		"leave_today":   leaves,
	})
}
