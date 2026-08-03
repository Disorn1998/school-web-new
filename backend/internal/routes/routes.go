package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all the application routes
func SetupRoutes(app *fiber.App) {
	// Serve static files for uploads
	app.Static("/uploads", "./uploads")

	api := app.Group("/api")

	// Public Routes (Testing only)
	api.Get("/admin/teachers_test", handlers.GetTeachers)
	api.Get("/admin/staff_test", handlers.GetStaff)

	// Authentication Routes
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login)

	// Admin Routes (Protected)
	admin := api.Group("/admin", middleware.Protected(), middleware.RoleGuard("super", "admin", "officer"))
	admin.Get("/dashboard/stats", handlers.GetDashboardStats)

	// Parent Management
	admin.Get("/parents", handlers.GetAllParents)
	admin.Get("/parents/:id", handlers.GetParent)
	admin.Post("/parents", handlers.CreateParent)
	admin.Put("/parents/:id", handlers.UpdateParent)
	admin.Delete("/parents/:id", handlers.DeleteParent)

	// Teacher and Staff Routes
	admin.Get("/teachers", handlers.GetTeachers)
	admin.Get("/staff", handlers.GetStaff)

	// File Uploads
	admin.Post("/upload", handlers.UploadImage)

	// Student Management
	admin.Get("/students", handlers.GetAllStudents)
	admin.Get("/students/:id", handlers.GetStudent)
	admin.Post("/students", handlers.CreateStudent)
	admin.Put("/students/:id", handlers.UpdateStudent)
	admin.Delete("/students/:id", handlers.DeleteStudent)

	// Attendance Management
	admin.Get("/attendance/daily", handlers.GetDailyAttendance)
	admin.Get("/attendance/report", handlers.GetMonthlyReport)
	admin.Get("/attendance/report/yearly", handlers.GetYearlyReport)
	admin.Get("/attendance/student/:id", handlers.GetStudentAttendance)
	admin.Post("/attendance/manual", handlers.ManualCheckIn)
	admin.Post("/attendance/bulk", handlers.BulkCheckIn)

	// Student Routes (Protected)
	student := api.Group("/student", middleware.Protected())
	student.Get("/profile", handlers.GetMyProfile)
	student.Get("/homework", handlers.GetMyHomework)
	student.Get("/invoices", handlers.GetMyInvoices)

	// === Phase 4: Academic & Operations ===

	// 4.1 Attendance
	api.Post("/attendance/checkin", middleware.Protected(), handlers.CheckIn)

	// 4.2 Homework
	homework := api.Group("/homework", middleware.Protected())
	homework.Get("/", handlers.GetAllHomework)
	homework.Post("/", middleware.RoleGuard("super", "admin", "teacher"), handlers.CreateHomework)
	homework.Put("/:id", middleware.RoleGuard("super", "admin", "teacher"), handlers.UpdateHomework)
	homework.Delete("/:id", middleware.RoleGuard("super", "admin", "teacher"), handlers.DeleteHomework)

	// 4.3 Invoices
	invoices := api.Group("/invoices", middleware.Protected())
	invoices.Get("/", middleware.RoleGuard("super", "admin", "officer"), handlers.GetAllInvoices)
	invoices.Post("/generate", middleware.RoleGuard("super", "admin", "officer"), handlers.GenerateInvoices)

	// 4.4 Webhook (Unprotected - Called by Bank)
	api.Post("/webhook/payment", handlers.WebhookPayment)
}
