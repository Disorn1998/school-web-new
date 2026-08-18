package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// --- TEACHER ACTIONS ---

// GetAssessments gets all assessments (TestScoreHeader) for a class/subject
func GetAssessments(c *fiber.Ctx) error {
	semesterID := c.Query("semester_id")
	subjectID := c.Query("subject_id")
	yearID := c.Query("year_id")

	query := database.DB.Preload("Subject").Preload("Year").Preload("Semester")

	if semesterID != "" {
		query = query.Where("semester_id = ?", semesterID)
	}
	if subjectID != "" {
		query = query.Where("subject_id = ?", subjectID)
	}
	if yearID != "" {
		query = query.Where("year_id = ?", yearID)
	}

	var headers []models.TestScoreHeader
	query.Order("created_at desc").Find(&headers)

	return c.JSON(headers)
}

// CreateAssessment creates a new test score header
func CreateAssessment(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	role := claims["role"].(string)
	if role != "teacher" && role != "super" && role != "officer" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.TestScoreHeader
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	req.CreatedAt = time.Now()

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create assessment"})
	}

	return c.JSON(req)
}

// GetAssessmentScores gets all scores (TestScoreDetail) for a specific header
func GetAssessmentScores(c *fiber.Ctx) error {
	headerID := c.Params("id")

	var header models.TestScoreHeader
	if err := database.DB.First(&header, headerID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Assessment not found"})
	}

	var students []models.Student
	database.DB.Where("year_id = ?", header.YearID).Find(&students)

	var details []models.TestScoreDetail
	database.DB.Where("header_id = ?", headerID).Find(&details)

	// Map existing details to student IDs
	detailMap := make(map[int]models.TestScoreDetail)
	for _, d := range details {
		detailMap[d.StudentID] = d
	}

	type StudentDetailResult struct {
		Student models.Student          `json:"student"`
		Detail  *models.TestScoreDetail `json:"detail"`
	}

	var results []StudentDetailResult
	for _, s := range students {
		var det *models.TestScoreDetail
		if d, ok := detailMap[s.ID]; ok {
			det = &d
		}
		results = append(results, StudentDetailResult{
			Student: s,
			Detail:  det,
		})
	}

	return c.JSON(fiber.Map{
		"header":  header,
		"records": results,
	})
}

// SaveAssessmentScores bulk saves student scores for an assessment
func SaveAssessmentScores(c *fiber.Ctx) error {
	headerID, _ := strconv.Atoi(c.Params("id"))

	type ScoreRecord struct {
		StudentID int     `json:"student_id"`
		Score     float64 `json:"score"`
		Comment   string  `json:"comment"`
	}

	type BulkRequest struct {
		Records []ScoreRecord `json:"records"`
	}

	var req BulkRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	for _, rec := range req.Records {
		var detail models.TestScoreDetail
		
		result := database.DB.Where("header_id = ? AND student_id = ?", headerID, rec.StudentID).First(&detail)

		if result.Error == nil {
			// Update
			detail.Score = rec.Score
			detail.Comment = rec.Comment
			database.DB.Save(&detail)
		} else {
			// Create
			newDetail := models.TestScoreDetail{
				HeaderID:  headerID,
				StudentID: rec.StudentID,
				Score:     rec.Score,
				Comment:   rec.Comment,
			}
			database.DB.Create(&newDetail)
		}
	}

	return c.JSON(fiber.Map{"message": "Scores saved successfully"})
}

// UploadExamFile uploads a file for a specific TestScoreDetail
func UploadExamFile(c *fiber.Ctx) error {
	detailID, _ := strconv.Atoi(c.Params("detail_id"))

	file, err := c.FormFile("exam_file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Failed to upload file"})
	}

	// Generate unique filename
	filename := strconv.FormatInt(time.Now().UnixNano(), 10) + "-" + file.Filename
	filePath := "./uploads/exam/" + filename

	// Save file
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Update database
	var detail models.TestScoreDetail
	if err := database.DB.First(&detail, detailID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Detail record not found"})
	}

	detail.FilePath = "/exam/" + filename
	if err := database.DB.Save(&detail).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update database"})
	}

	return c.JSON(fiber.Map{
		"message":   "File uploaded successfully",
		"file_path": detail.FilePath,
	})
}

// --- STUDENT ACTIONS ---

// GetStudentAcademicReport calculates weighted grades and fetches assessment history
func GetStudentAcademicReport(c *fiber.Ctx) error {
	studentIDParam := c.Params("id")
	semesterID := c.Query("semester_id")

	if semesterID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "semester_id is required"})
	}

	var student models.Student
	if err := database.DB.Preload("Year").First(&student, studentIDParam).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Student not found"})
	}

	// Calculate attendance summaries
	var totalAbsent int64
	var totalLate int64
	database.DB.Model(&models.StudentAttendance{}).Where("student_id = ? AND semester_id = ? AND status = ?", studentIDParam, semesterID, "Absent").Count(&totalAbsent)
	database.DB.Model(&models.StudentAttendance{}).Where("student_id = ? AND semester_id = ? AND status = ?", studentIDParam, semesterID, "Late").Count(&totalLate)

	// Fetch all header and detail records for this student and semester
	type ReportData struct {
		SubjectName string  `json:"subject_name"`
		ReportName  string  `json:"report_name"`
		Score       float64 `json:"score"`
		FullScore   float64 `json:"full_score"`
		Comment     string  `json:"comment"`
		ClassAvg    float64 `json:"class_avg"`
		TestDate    string  `json:"test_date"`
		FilePath    string  `json:"file_path"`
	}

	var rawData []ReportData
	query := `
		SELECT sub.subject_name, tsh.report_name, tsd.score, tsh.full_score, tsd.comment, tsh.test_date, tsd.file_path,
			(SELECT ROUND(AVG((d2.score / h2.full_score) * 100), 2) 
			 FROM test_scores_details d2 
			 JOIN test_scores_header h2 ON d2.header_id = h2.id 
			 WHERE h2.subject_id = tsh.subject_id AND h2.semester_id = tsh.semester_id 
			 AND h2.report_name = tsh.report_name AND d2.score > 0 AND h2.full_score > 0) as class_avg
		FROM test_scores_header tsh
		JOIN subjects sub ON tsh.subject_id = sub.id
		JOIN test_scores_details tsd ON tsh.id = tsd.header_id
		WHERE tsd.student_id = ? AND tsh.semester_id = ?
		ORDER BY sub.subject_name ASC, tsh.created_at ASC
	`
	database.DB.Raw(query, studentIDParam, semesterID).Scan(&rawData)

	// Group by subject and calculate grades
	groupedData := make(map[string][]ReportData)
	for _, r := range rawData {
		groupedData[r.SubjectName] = append(groupedData[r.SubjectName], r)
	}

	type SubjectGrade struct {
		Subject      string       `json:"subject"`
		Grade        float64      `json:"grade"`
		ClassAvg     float64      `json:"class_avg"`
		ExamComment  string       `json:"exam_comment"`
		Assessments  []ReportData `json:"assessments"`
	}

	var subjectGrades []SubjectGrade
	var totalGrade float64
	var totalClassAvg float64
	var countGrade int

	for subject, items := range groupedData {
		var hasEffort bool
		var scoreEffort float64
		var scoreExam float64
		var scoreOthers []float64
		var examComment string
		var subjectClassAvgs []float64

		for _, item := range items {
			val := 0.0
			if item.FullScore > 0 {
				val = (item.Score / item.FullScore) * 100
			}

			if item.ReportName == "Effort & Participation" {
				hasEffort = true
				scoreEffort = val
			} else if item.ReportName == "EXAMINATION" {
				scoreExam = val
				examComment = item.Comment
			} else {
				scoreOthers = append(scoreOthers, val)
			}
			
			if item.ClassAvg > 0 {
				subjectClassAvgs = append(subjectClassAvgs, item.ClassAvg)
			}
		}

		avgOthers := 0.0
		if len(scoreOthers) > 0 {
			sum := 0.0
			for _, s := range scoreOthers {
				sum += s
			}
			avgOthers = sum / float64(len(scoreOthers))
		}

		finalGrade := 0.0
		if hasEffort {
			finalGrade = (scoreEffort * 0.05) + (avgOthers * 0.45) + (scoreExam * 0.50)
		} else {
			finalGrade = (avgOthers * 0.50) + (scoreExam * 0.50)
		}

		finalClassAvg := 0.0
		if len(subjectClassAvgs) > 0 {
			sum := 0.0
			for _, s := range subjectClassAvgs {
				sum += s
			}
			finalClassAvg = sum / float64(len(subjectClassAvgs))
		}

		subjectGrades = append(subjectGrades, SubjectGrade{
			Subject:     subject,
			Grade:       finalGrade,
			ClassAvg:    finalClassAvg,
			ExamComment: examComment,
			Assessments: items,
		})

		if finalGrade > 0 {
			totalGrade += finalGrade
			totalClassAvg += finalClassAvg
			countGrade++
		}
	}

	overallGPA := 0.0
	overallClassAvg := 0.0
	if countGrade > 0 {
		overallGPA = totalGrade / float64(countGrade)
		overallClassAvg = totalClassAvg / float64(countGrade)
	}

	return c.JSON(fiber.Map{
		"student":           student,
		"total_absent":      totalAbsent,
		"total_late":        totalLate,
		"subjects":          subjectGrades,
		"overall_gpa":       overallGPA,
		"overall_class_avg": overallClassAvg,
	})
}
