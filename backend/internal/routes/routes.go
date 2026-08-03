package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all the application routes
func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Authentication Routes
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login)

	// Example of a protected Admin Route
	admin := api.Group("/admin", middleware.Protected(), middleware.RoleGuard("super", "admin"))
	admin.Get("/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Welcome to the Admin Dashboard!"})
	})

	// Example of a protected Student Route
	student := api.Group("/student", middleware.Protected()) // Can add student specific guard if needed
	student.Get("/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Welcome to the Student Dashboard!"})
	})
}
