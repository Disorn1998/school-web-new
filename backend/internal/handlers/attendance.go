package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"
	"fmt"

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

// GetDailyAttendance returns the attendance overview for a specific date
func GetDailyAttendance(c *fiber.Ctx) error {
	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	// Fetch all students
	var students []models.Student
	if err := database.DB.Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	// Fetch attendance for the specific date
	var attendances []models.Attendance
	if err := database.DB.Where("work_date = ?", dateStr).Find(&attendances).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch attendance"})
	}

	// Map attendance by UserID for fast lookup
	attMap := make(map[int]models.Attendance)
	for _, a := range attendances {
		attMap[a.UserID] = a
	}

	type DailyAttendanceResponse struct {
		Student    models.Student     `json:"student"`
		Attendance *models.Attendance `json:"attendance"`
	}

	var response []DailyAttendanceResponse
	for _, student := range students {
		var att *models.Attendance
		if a, exists := attMap[student.ID]; exists {
			att = &a
		}
		response = append(response, DailyAttendanceResponse{
			Student:    student,
			Attendance: att,
		})
	}

	return c.JSON(response)
}

// ManualCheckIn allows admins to manually check in a student
func ManualCheckIn(c *fiber.Ctx) error {
	type ManualCheckInInput struct {
		UserID   int    `json:"user_id"`
		WorkDate string `json:"work_date"`
		CheckIn  string `json:"check_in"`
		Status   string `json:"status"` // 'ontime', 'late', 'absent'
	}

	var input ManualCheckInInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.WorkDate == "" {
		input.WorkDate = time.Now().Format("2006-01-02")
	}
	if input.CheckIn == "" {
		input.CheckIn = time.Now().Format("15:04:05")
	}
	if input.Status == "" {
		input.Status = "ontime"
	}

	// Check if attendance already exists
	var existing models.Attendance
	if err := database.DB.Where("user_id = ? AND work_date = ?", input.UserID, input.WorkDate).First(&existing).Error; err == nil {
		// Update existing
		existing.CheckIn = input.CheckIn
		existing.Status = input.Status
		if err := database.DB.Save(&existing).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update attendance"})
		}
		return c.JSON(fiber.Map{"message": "Attendance updated successfully", "data": existing})
	}

	// Create new
	attendance := models.Attendance{
		UserID:      input.UserID,
		WorkDate:    input.WorkDate,
		CheckIn:     input.CheckIn,
		Status:      input.Status,
		LateMinutes: 0,
		IPAddress:   "Manual Entry",
		Latitude:    0,
		Longitude:   0,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record manual attendance"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Manual check-in successful",
		"data":    attendance,
	})
}

// GetStudentAttendance returns the attendance history for a specific student
func GetStudentAttendance(c *fiber.Ctx) error {
	userID := c.Params("id")
	var attendances []models.Attendance
	
	// Fetch up to 60 days of history
	if err := database.DB.Where("user_id = ?", userID).Order("work_date DESC").Limit(60).Find(&attendances).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch attendance history"})
	}
	
	return c.JSON(attendances)
}

// BulkCheckIn allows saving attendance for multiple students at once
func BulkCheckIn(c *fiber.Ctx) error {
	type BulkInput struct {
		WorkDate string `json:"work_date"`
		Records  []struct {
			UserID  int    `json:"user_id"`
			Status  string `json:"status"` // 'ontime', 'late', 'absent'
		} `json:"records"`
	}

	var input BulkInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.WorkDate == "" {
		input.WorkDate = time.Now().Format("2006-01-02")
	}
	checkInTime := time.Now().Format("15:04:05")

	// Start a transaction for bulk update
	tx := database.DB.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to start transaction"})
	}

	for _, record := range input.Records {
		if record.Status == "" {
			continue // skip empty
		}

		var existing models.Attendance
		if err := tx.Where("user_id = ? AND work_date = ?", record.UserID, input.WorkDate).First(&existing).Error; err == nil {
			// Update
			existing.Status = record.Status
			existing.CheckIn = checkInTime
			if err := tx.Save(&existing).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update attendance"})
			}
		} else {
			// Insert
			att := models.Attendance{
				UserID:      record.UserID,
				WorkDate:    input.WorkDate,
				CheckIn:     checkInTime,
				Status:      record.Status,
				LateMinutes: 0,
				IPAddress:   "Bulk Entry",
			}
			if err := tx.Create(&att).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to insert attendance"})
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to commit transaction"})
	}

	return c.JSON(fiber.Map{"message": "Bulk attendance saved successfully"})
}

// GetMonthlyReport returns attendance grouped by student for a given month and year
func GetMonthlyReport(c *fiber.Ctx) error {
	yearStr := c.Query("year")
	monthStr := c.Query("month")
	yearID := c.Query("year_id") // Class Year ID filter

	if yearStr == "" {
		yearStr = time.Now().Format("2006")
	}
	if monthStr == "" {
		monthStr = time.Now().Format("01")
	}

	// Fetch all students (filtered by year_id if provided)
	var students []models.Student
	query := database.DB.Model(&models.Student{})
	if yearID != "" {
		query = query.Where("year_id = ?", yearID)
	}
	if err := query.Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	// Date prefix for the month e.g., "2026-08-%"
	datePrefix := fmt.Sprintf("%s-%s-%%", yearStr, monthStr)

	var attendances []models.Attendance
	if err := database.DB.Where("work_date LIKE ?", datePrefix).Find(&attendances).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch attendance records"})
	}

	// Map attendance records: StudentID -> WorkDate -> Status
	attMap := make(map[int]map[string]string)
	for _, a := range attendances {
		if _, ok := attMap[a.UserID]; !ok {
			attMap[a.UserID] = make(map[string]string)
		}
		attMap[a.UserID][a.WorkDate] = a.Status
	}

	type MonthlyReportResponse struct {
		Student    models.Student    `json:"student"`
		Attendance map[string]string `json:"attendance"` // e.g. "2026-08-01": "ontime"
	}

	var response []MonthlyReportResponse
	for _, student := range students {
		studentAtt, ok := attMap[student.ID]
		if !ok {
			studentAtt = make(map[string]string)
		}
		response = append(response, MonthlyReportResponse{
			Student:    student,
			Attendance: studentAtt,
		})
	}

	return c.JSON(response)
}

// GetYearlyReport returns summarized attendance grouped by student and month for a given year
func GetYearlyReport(c *fiber.Ctx) error {
	yearStr := c.Query("year")
	yearID := c.Query("year_id") // Class Year ID filter

	if yearStr == "" {
		yearStr = time.Now().Format("2006")
	}

	// Fetch all students (filtered by year_id if provided)
	var students []models.Student
	query := database.DB.Model(&models.Student{})
	if yearID != "" {
		query = query.Where("year_id = ?", yearID)
	}
	if err := query.Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	// Date prefix for the year e.g., "2026-%"
	datePrefix := fmt.Sprintf("%s-%%", yearStr)

	var attendances []models.Attendance
	if err := database.DB.Where("work_date LIKE ?", datePrefix).Find(&attendances).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch attendance records"})
	}

	type MonthStats struct {
		Present int `json:"present"`
		Late    int `json:"late"`
		Absent  int `json:"absent"`
	}

	// Map: StudentID -> Month (01-12) -> Stats
	attMap := make(map[int]map[string]*MonthStats)
	for _, a := range attendances {
		if len(a.WorkDate) >= 7 { // yyyy-mm-dd
			monthStr := a.WorkDate[5:7]
			
			if _, ok := attMap[a.UserID]; !ok {
				attMap[a.UserID] = make(map[string]*MonthStats)
			}
			if _, ok := attMap[a.UserID][monthStr]; !ok {
				attMap[a.UserID][monthStr] = &MonthStats{}
			}
			
			stats := attMap[a.UserID][monthStr]
			if a.Status == "ontime" {
				stats.Present++
			} else if a.Status == "late" {
				stats.Late++
			} else if a.Status == "absent" {
				stats.Absent++
			}
		}
	}

	type YearlyReportResponse struct {
		Student models.Student           `json:"student"`
		Months  map[string]MonthStats    `json:"months"`
	}

	var response []YearlyReportResponse
	for _, student := range students {
		studentMonths := make(map[string]MonthStats)
		if monthMap, ok := attMap[student.ID]; ok {
			for m, s := range monthMap {
				studentMonths[m] = *s
			}
		}
		response = append(response, YearlyReportResponse{
			Student: student,
			Months:  studentMonths,
		})
	}

	return c.JSON(response)
}
