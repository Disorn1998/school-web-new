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

// GetTeacherLessonPlans fetches all lesson plans uploaded by the current teacher
func GetTeacherLessonPlans(c *fiber.Ctx) error {
	// In the legacy system, lesson materials were just filtered by year, subject, date.
	// But let's add teacher check if we want, or just let them see all like legacy.
	// We'll let them see all, filtered by queries.
	yearID := c.Query("year_id")
	subjectID := c.Query("subject_id")

	var materials []models.LessonMaterial
	query := database.DB.Preload("Year").Preload("Subject")
	
	if yearID != "" {
		query = query.Where("year_id = ?", yearID)
	}
	if subjectID != "" {
		query = query.Where("subject_id = ?", subjectID)
	}

	query.Order("lesson_date desc").Find(&materials)

	return c.JSON(materials)
}

// UploadLessonPlan creates a new lesson material
func UploadLessonPlan(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	role := claims["role"].(string)

	if role != "teacher" && role != "super" && role != "officer" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	yearID, _ := strconv.Atoi(c.FormValue("year_id"))
	subjectID, _ := strconv.Atoi(c.FormValue("subject_id"))
	title := c.FormValue("title")
	lessonDate := c.FormValue("lesson_date")
	externalURL := c.FormValue("external_url")

	// Handle optional file upload
	fileUrl := ""
	file, err := c.FormFile("pdf_file")
	if err == nil {
		uploadDir := "./uploads/materials/"
		os.MkdirAll(uploadDir, os.ModePerm)
		fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		savePath := filepath.Join(uploadDir, fileName)

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
		fileUrl = "/uploads/materials/" + fileName
	}

	material := models.LessonMaterial{
		YearID:      yearID,
		SubjectID:   subjectID,
		Title:       title,
		LessonDate:  lessonDate,
		FileURL:     fileUrl,
		ExternalURL: externalURL,
		CreatedAt:   time.Now(),
	}

	if err := database.DB.Create(&material).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save lesson material"})
	}

	return c.JSON(fiber.Map{"message": "Lesson material uploaded successfully", "material": material})
}

// DeleteLessonPlan removes a lesson material
func DeleteLessonPlan(c *fiber.Ctx) error {
	id := c.Params("id")
	claims := c.Locals("user").(jwt.MapClaims)
	role := claims["role"].(string)

	if role != "teacher" && role != "super" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var material models.LessonMaterial
	if err := database.DB.First(&material, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Lesson material not found"})
	}

	database.DB.Delete(&material)
	return c.JSON(fiber.Map{"message": "Lesson material deleted"})
}
