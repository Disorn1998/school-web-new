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

	// Admin Routes (Protected)
	admin := api.Group("/admin", middleware.Protected(), middleware.RoleGuard("super", "admin", "officer"))
	admin.Get("/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Welcome to the Admin Dashboard!"})
	})

	// Parent Management
	admin.Get("/parents", handlers.GetAllParents)
	admin.Get("/parents/:id", handlers.GetParent)
	admin.Post("/parents", handlers.CreateParent)
	admin.Put("/parents/:id", handlers.UpdateParent)
	admin.Delete("/parents/:id", handlers.DeleteParent)

	// Student Management
	admin.Get("/students", handlers.GetAllStudents)
	admin.Get("/students/:id", handlers.GetStudent)
	admin.Post("/students", handlers.CreateStudent)
	admin.Put("/students/:id", handlers.UpdateStudent)
	admin.Delete("/students/:id", handlers.DeleteStudent)

	// Student Routes (Protected)
	student := api.Group("/student", middleware.Protected())
	student.Get("/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Welcome to the Student Dashboard!"})
	})
}
