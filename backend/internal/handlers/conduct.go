package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetConductHeaders returns a list of conduct reports
func GetConductHeaders(c *fiber.Ctx) error {
	semesterID := c.Query("semester_id")
	yearID := c.Query("year_id")

	query := database.DB.Preload("Semester").Preload("Year").Preload("Teacher")

	if semesterID != "" {
		query = query.Where("semester_id = ?", semesterID)
	}
	if yearID != "" {
		query = query.Where("year_id = ?", yearID)
	}

	var headers []models.ConductScoreHeader
	query.Order("evaluation_date desc").Find(&headers)

	return c.JSON(headers)
}

// CreateConductHeader creates a new conduct evaluation and returns its ID
func CreateConductHeader(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	teacherID := int(claims["id"].(float64))
	role := claims["role"].(string)

	if role != "teacher" && role != "super" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	type CreateReq struct {
		SemesterID     int    `json:"semester_id"`
		YearID         int    `json:"year_id"`
		EvaluationDate string `json:"evaluation_date"`
	}

	var req CreateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	header := models.ConductScoreHeader{
		SemesterID:     req.SemesterID,
		YearID:         req.YearID,
		TeacherID:      teacherID,
		EvaluationDate: req.EvaluationDate,
		CreatedAt:      time.Now(),
	}

	if err := database.DB.Create(&header).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create conduct header"})
	}

	return c.JSON(header)
}

// GetConductDetails fetches the matrix data for the teacher
func GetConductDetails(c *fiber.Ctx) error {
	headerID := c.Params("id")

	var header models.ConductScoreHeader
	if err := database.DB.First(&header, headerID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}

	var students []models.Student
	database.DB.Where("year_id = ?", header.YearID).Find(&students)

	var categories []models.ConductCategory
	database.DB.Order("type, sort_order").Find(&categories)

	var details []models.ConductScoreDetail
	database.DB.Where("header_id = ?", headerID).Find(&details)

	var comments []models.ConductGeneralComment
	database.DB.Where("header_id = ?", headerID).Find(&comments)

	return c.JSON(fiber.Map{
		"header":     header,
		"students":   students,
		"categories": categories,
		"details":    details,
		"comments":   comments,
	})
}

// SaveConductDetails bulk saves the matrix and comments
func SaveConductDetails(c *fiber.Ctx) error {
	headerID, _ := strconv.Atoi(c.Params("id"))

	type ScoreInput struct {
		StudentID  int `json:"student_id"`
		CategoryID int `json:"category_id"`
		Score      int `json:"score"`
	}

	type CommentInput struct {
		StudentID int    `json:"student_id"`
		Comment   string `json:"comment"`
	}

	type BulkReq struct {
		Scores   []ScoreInput   `json:"scores"`
		Comments []CommentInput `json:"comments"`
	}

	var req BulkReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	tx := database.DB.Begin()

	// Handle Scores
	for _, s := range req.Scores {
		var detail models.ConductScoreDetail
		res := tx.Where("header_id = ? AND student_id = ? AND category_id = ?", headerID, s.StudentID, s.CategoryID).First(&detail)
		if res.Error == nil {
			detail.Score = s.Score
			tx.Save(&detail)
		} else {
			tx.Create(&models.ConductScoreDetail{
				HeaderID:   headerID,
				StudentID:  s.StudentID,
				CategoryID: s.CategoryID,
				Score:      s.Score,
			})
		}
	}

	// Handle Comments
	for _, cm := range req.Comments {
		var gComment models.ConductGeneralComment
		res := tx.Where("header_id = ? AND student_id = ?", headerID, cm.StudentID).First(&gComment)
		if res.Error == nil {
			gComment.GeneralComment = cm.Comment
			tx.Save(&gComment)
		} else {
			if cm.Comment != "" {
				tx.Create(&models.ConductGeneralComment{
					HeaderID:       headerID,
					StudentID:      cm.StudentID,
					GeneralComment: cm.Comment,
				})
			}
		}
	}

	tx.Commit()

	return c.JSON(fiber.Map{"message": "Conduct scores saved successfully"})
}

// GetStudentConductReport returns the conduct report for a single student (Parent/Student view)
func GetStudentConductReport(c *fiber.Ctx) error {
	studentID := c.Params("student_id")
	semesterID := c.Query("semester_id")

	if semesterID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "semester_id is required"})
	}

	var student models.Student
	if err := database.DB.Preload("Year").First(&student, studentID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Student not found"})
	}

	var header models.ConductScoreHeader
	if err := database.DB.Preload("Teacher").Where("semester_id = ? AND year_id = ?", semesterID, student.YearID).Order("evaluation_date desc").First(&header).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No conduct report found for this semester"})
	}

	var details []models.ConductScoreDetail
	database.DB.Preload("Category").Where("header_id = ? AND student_id = ?", header.ID, studentID).Find(&details)

	var comment models.ConductGeneralComment
	database.DB.Where("header_id = ? AND student_id = ?", header.ID, studentID).First(&comment)

	return c.JSON(fiber.Map{
		"header":  header,
		"student": student,
		"details": details,
		"comment": comment,
	})
}
