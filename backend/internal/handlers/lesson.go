package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetLessonPlans returns all plans for admins, or only the teacher's own plans
func GetLessonPlans(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)
	adminID := int(user["id"].(float64))

	var plans []models.LessonPlan
	query := database.DB.Preload("Teacher").Order("created_at desc")

	if role == "teacher" {
		query = query.Where("teacher_id = ?", adminID)
	}

	if err := query.Find(&plans).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch lesson plans"})
	}

	return c.JSON(plans)
}

func CreateLessonPlan(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	if user["role"] == "student" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.LessonPlan
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	req.TeacherID = int(user["id"].(float64))
	req.Status = "Pending"
	req.FilePath = "/uploads/mock_lesson_plan.pdf" // Mock file path

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create lesson plan"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

func UpdateLessonPlanStatus(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)

	if role == "teacher" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins/officers can review lesson plans"})
	}

	id := c.Params("id")
	var req struct {
		Status   string `json:"status"`
		Feedback string `json:"feedback"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var plan models.LessonPlan
	if err := database.DB.First(&plan, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Lesson plan not found"})
	}

	plan.Status = req.Status
	plan.Feedback = req.Feedback

	if err := database.DB.Save(&plan).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update lesson plan"})
	}

	return c.JSON(plan)
}
