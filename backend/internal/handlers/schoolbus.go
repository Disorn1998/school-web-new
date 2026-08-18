package handlers

import (
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetAllSchoolBusRoutes returns all bus routes
func GetAllSchoolBusRoutes(c *fiber.Ctx) error {
	var routes []models.SchoolBusRoute
	if err := database.DB.Find(&routes).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch routes"})
	}
	return c.JSON(routes)
}

// CreateSchoolBusRoute creates a new bus route
func CreateSchoolBusRoute(c *fiber.Ctx) error {
	var route models.SchoolBusRoute
	if err := c.BodyParser(&route); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Create(&route).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create route"})
	}
	return c.Status(fiber.StatusCreated).JSON(route)
}

// GetSchoolBusRegistrations returns registrations for a route or semester
func GetSchoolBusRegistrations(c *fiber.Ctx) error {
	routeID := c.Query("route_id")
	semesterID := c.Query("semester_id")

	query := database.DB.Preload("Student").Preload("Route")
	
	if routeID != "" {
		query = query.Where("route_id = ?", routeID)
	}
	if semesterID != "" {
		query = query.Where("semester_id = ?", semesterID)
	}

	var registrations []models.SchoolBusRegistration
	if err := query.Find(&registrations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch registrations"})
	}

	return c.JSON(registrations)
}

// RegisterStudentBus registers a student for the bus
func RegisterStudentBus(c *fiber.Ctx) error {
	var reg models.SchoolBusRegistration
	if err := c.BodyParser(&reg); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Validate Student ID
	if reg.StudentID == 0 {
		user := c.Locals("user").(jwt.MapClaims)
		if user["role"] == "student" {
			reg.StudentID = int(user["id"].(float64))
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Student ID is required"})
		}
	}

	// Fetch active semester if not provided
	if reg.SemesterID == 0 {
		var activeSem models.Semester
		if err := database.DB.Where("status = ?", "ACTIVE").First(&activeSem).Error; err == nil {
			reg.SemesterID = activeSem.ID
		} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Semester ID is required and no active semester found"})
		}
	}

	// Check route capacity
	var route models.SchoolBusRoute
	if err := database.DB.First(&route, reg.RouteID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Route not found"})
	}

	var currentCount int64
	database.DB.Model(&models.SchoolBusRegistration{}).Where("route_id = ? AND semester_id = ? AND status = ?", reg.RouteID, reg.SemesterID, "Active").Count(&currentCount)

	if currentCount >= int64(route.MaxCapacity) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Bus route is full"})
	}

	// Create registration
	if err := database.DB.Create(&reg).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to register for bus"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Registered successfully", "registration": reg})
}

// GetStudentBusRegistration gets a specific student's registration
func GetStudentBusRegistration(c *fiber.Ctx) error {
	studentID := c.Params("id")
	semesterID := c.Query("semester_id")

	query := database.DB.Preload("Route").Where("student_id = ?", studentID)
	if semesterID != "" {
		query = query.Where("semester_id = ?", semesterID)
	}

	var registrations []models.SchoolBusRegistration
	if err := query.Find(&registrations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch student bus registration"})
	}

	return c.JSON(registrations)
}
