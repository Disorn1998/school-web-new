package handlers

import (
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"
	"time"

	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ImportStudentsCSV handles bulk uploading of students via CSV
func ImportStudentsCSV(c *fiber.Ctx) error {
	file, err := c.FormFile("csv_file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing CSV file"})
	}

	f, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Cannot open file"})
	}
	defer f.Close()

	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid CSV format"})
	}

	if len(records) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "CSV must contain headers and at least one row of data"})
	}

	tx := database.DB.Begin()
	successCount := 0

	// Skip header (i=0)
	for i := 1; i < len(records); i++ {
		row := records[i]
		if len(row) < 11 || strings.TrimSpace(row[0]) == "" {
			continue // Skip invalid rows or empty student IDs
		}

		studentID := strings.TrimSpace(row[0])
		fullname := strings.TrimSpace(row[1])
		nickname := strings.TrimSpace(row[2])
		yearID, _ := strconv.Atoi(strings.TrimSpace(row[3]))
		email := strings.TrimSpace(row[4])
		phone := strings.TrimSpace(row[5])
		enrollYear, _ := strconv.Atoi(strings.TrimSpace(row[6]))
		dob := strings.TrimSpace(row[7])
		food := strings.TrimSpace(row[8])
		health := strings.TrimSpace(row[9])
		parentID, _ := strconv.Atoi(strings.TrimSpace(row[10]))

		var student models.Student
		err := tx.Where("student_id = ?", studentID).First(&student).Error

		if err != nil {
			// New Student
			student = models.Student{
				StudentUUID:       uuid.New().String(),
				StudentID:         studentID,
				Fullname:          fullname,
				Nickname:          nickname,
				YearID:            yearID,
				Email:             email,
				Phone:             phone,
				ParentID:          parentID,
				Status:            "active",
				EnrollmentYear:    enrollYear,
				DateOfBirth:       dob,
				FoodLimitations:   food,
				HealthLimitations: health,
			}
			if err := tx.Create(&student).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to insert row %d: %v", i+1, err)})
			}
		} else {
			// Update existing student
			student.Fullname = fullname
			student.Nickname = nickname
			student.YearID = yearID
			student.Email = email
			student.Phone = phone
			student.ParentID = parentID
			student.EnrollmentYear = enrollYear
			student.DateOfBirth = dob
			student.FoodLimitations = food
			student.HealthLimitations = health
			if err := tx.Save(&student).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Failed to update row %d: %v", i+1, err)})
			}
		}
		successCount++
	}

	tx.Commit()

	return c.JSON(fiber.Map{
		"message":       "Import successful",
		"records_saved": successCount,
	})
}

// ExportStudentsCSV handles downloading students as CSV
func ExportStudentsCSV(c *fiber.Ctx) error {
	yearID := c.Query("year_id")

	var students []models.Student
	query := database.DB.Preload("Year").Order("year_id asc, fullname asc")

	if yearID != "" && yearID != "0" {
		query = query.Where("year_id = ?", yearID)
	}

	if err := query.Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=students_export_%s.csv", time.Now().Format("20060102_150405")))

	// Write CSV to response
	writer := csv.NewWriter(c.Response().BodyWriter())

	// Write Headers
	writer.Write([]string{"StudentID", "Fullname", "Nickname", "YearID", "YearName", "Email", "Phone", "EnrollmentYear", "DateOfBirth", "FoodLimitations", "HealthLimitations", "ParentID"})

	// Write Data
	for _, s := range students {
		yearName := ""
		if s.Year != nil {
			yearName = s.Year.YearName
		}
		writer.Write([]string{
			s.StudentID,
			s.Fullname,
			s.Nickname,
			strconv.Itoa(s.YearID),
			yearName,
			s.Email,
			s.Phone,
			strconv.Itoa(s.EnrollmentYear),
			s.DateOfBirth,
			s.FoodLimitations,
			s.HealthLimitations,
			strconv.Itoa(s.ParentID),
		})
	}
	writer.Flush()

	return nil
}

// PromoteStudents handles mass promotion of students
func PromoteStudents(c *fiber.Ctx) error {
	type Request struct {
		Action        string `json:"action"` // "individual", "class", "all"
		StudentID     int    `json:"student_id,omitempty"`
		TargetYearID  int    `json:"target_year_id,omitempty"`
		SourceYearID  int    `json:"source_year_id,omitempty"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	tx := database.DB.Begin()

	if req.Action == "individual" {
		if err := tx.Model(&models.Student{}).Where("id = ?", req.StudentID).Update("year_id", req.TargetYearID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to promote individual student"})
		}
	} else if req.Action == "class" {
		if err := tx.Model(&models.Student{}).Where("year_id = ?", req.SourceYearID).Update("year_id", req.TargetYearID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to promote class"})
		}
	} else if req.Action == "all" {
		// Define promotion mapping (YearID -> NextYearID)
		// Assuming: 1->2, 2->3, etc. based on legacy Map
		// Note: We'll query all years and shift ID + 1 if the next year exists
		
		promotionMap := map[int]int{
			1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7,
			7: 8, 8: 9, 9: 10, 10: 11, 11: 12,
			12: 13, 13: 14, 14: 15, 15: 17, // From legacy logic
		}

		for currentYear, nextYear := range promotionMap {
			if err := tx.Model(&models.Student{}).Where("status = ? AND year_id = ?", "active", currentYear).Update("year_id", nextYear).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to promote whole school"})
			}
		}
	} else {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid action"})
	}

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Promotion successful"})
}
