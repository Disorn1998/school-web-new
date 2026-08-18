package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// --- TEACHER ACTIONS ---

// GetTeacherHomeworks lists all homework set by a teacher
func GetTeacherHomeworks(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	teacherID := int(claims["id"].(float64))

	var homeworks []models.Homework
	database.DB.Preload("Year").Preload("Subject").Preload("Semester").
		Where("admin_id = ?", teacherID).Order("date_due desc").Find(&homeworks)

	return c.JSON(homeworks)
}

// CreateHomework allows a teacher to set new homework
func CreateHomework(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	teacherID := int(claims["id"].(float64))

	// Get form values
	semesterID, _ := strconv.Atoi(c.FormValue("semester_id"))
	yearID, _ := strconv.Atoi(c.FormValue("year_id"))
	subjectID, _ := strconv.Atoi(c.FormValue("subject_id"))
	dateSet := c.FormValue("date_set")
	dateDue := c.FormValue("date_due")
	description := c.FormValue("description")

	// Handle optional file upload
	fileUrl := ""
	file, err := c.FormFile("attachment")
	if err == nil {
		uploadDir := "./uploads/homework/"
		os.MkdirAll(uploadDir, os.ModePerm)
		fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		savePath := filepath.Join(uploadDir, fileName)

		// Save file
		src, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to open uploaded file"})
		}
		defer src.Close()

		dst, err := os.Create(savePath)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create file on server"})
		}
		defer dst.Close()

		io.Copy(dst, src)
		fileUrl = "/uploads/homework/" + fileName
	}

	hw := models.Homework{
		SemesterID:  semesterID,
		AdminID:     teacherID,
		YearID:      yearID,
		SubjectID:   subjectID,
		DateSet:     dateSet,
		DateDue:     dateDue,
		Description: description,
		Attachment:  fileUrl,
		CreatedAt:   time.Now(),
	}

	if err := database.DB.Create(&hw).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save homework"})
	}

	return c.JSON(fiber.Map{"message": "Homework created successfully", "homework": hw})
}

// DeleteHomework allows a teacher to delete a homework
func DeleteHomework(c *fiber.Ctx) error {
	id := c.Params("id")
	claims := c.Locals("user").(jwt.MapClaims)
	teacherID := int(claims["id"].(float64))

	var hw models.Homework
	if err := database.DB.First(&hw, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Homework not found"})
	}

	if hw.AdminID != teacherID {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized to delete this homework"})
	}

	database.DB.Delete(&hw)
	return c.JSON(fiber.Map{"message": "Homework deleted"})
}

// --- STUDENT ACTIONS ---

// GetStudentHomeworks gets all active homework for a specific student's class
func GetStudentHomeworks(c *fiber.Ctx) error {
	studentIDParam := c.Params("id") // The student to fetch homework for
	var student models.Student
	
	if err := database.DB.First(&student, studentIDParam).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Student not found"})
	}

	var homeworks []models.Homework
	database.DB.Preload("Teacher").Preload("Subject").Preload("Semester").
		Where("year_id = ?", student.YearID).
		Order("date_due desc").
		Find(&homeworks)

	return c.JSON(homeworks)
}
