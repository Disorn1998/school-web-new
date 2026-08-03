package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetDashboardStats(c *fiber.Ctx) error {
	// 1. Total Students
	var totalStudents int64
	if err := database.DB.Model(&models.Student{}).Count(&totalStudents).Error; err != nil {
		totalStudents = 0
	}

	// 2. Today's Attendance
	today := time.Now().Format("2006-01-02")
	var totalPresent int64
	database.DB.Model(&models.Attendance{}).Where("work_date = ? AND status = ?", today, "ontime").Count(&totalPresent)

	var totalAttendanceRecords int64
	database.DB.Model(&models.Attendance{}).Where("work_date = ?", today).Count(&totalAttendanceRecords)

	attendanceRate := 0.0
	if totalAttendanceRecords > 0 {
		attendanceRate = (float64(totalPresent) / float64(totalAttendanceRecords)) * 100
	} else if totalStudents > 0 {
		// If no attendance records yet, assume 0% or maybe we just don't have records yet
		attendanceRate = 0
	}

	// 3. Pending Invoices
	type InvoiceResult struct {
		TotalAmount float64
		Count       int64
	}
	var invResult InvoiceResult
	database.DB.Model(&models.Invoice{}).
		Select("COALESCE(SUM(total_amount), 0) as total_amount, COUNT(id) as count").
		Where("status = ?", "Pending").
		Scan(&invResult)

	return c.JSON(fiber.Map{
		"total_students":   totalStudents,
		"attendance_rate":  attendanceRate,
		"students_present": totalPresent,
		"pending_invoices": invResult.TotalAmount,
		"pending_count":    invResult.Count,
	})
}
