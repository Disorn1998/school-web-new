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
	admin.Post("/personnel", handlers.CreateAdmin)
	admin.Put("/personnel/:id", handlers.UpdateAdmin)
	admin.Delete("/personnel/:id", handlers.DeleteAdmin)

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

	// Settings & Academic Configurations
	admin.Get("/settings/years", handlers.GetYears)
	admin.Post("/settings/years", handlers.CreateYear)
	admin.Put("/settings/years/:id", handlers.UpdateYear)
	admin.Delete("/settings/years/:id", handlers.DeleteYear)

	admin.Get("/settings/semesters", handlers.GetSemesters)
	admin.Post("/settings/semesters", handlers.CreateSemester)
	admin.Put("/settings/semesters/:id", handlers.UpdateSemester)
	admin.Delete("/settings/semesters/:id", handlers.DeleteSemester)

	admin.Get("/settings/tuition-fees", handlers.GetTuitionFees)
	admin.Post("/settings/tuition-fees", handlers.SetTuitionFee)

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

	// 4.3 Invoices (Finance)
	invoices := api.Group("/invoices", middleware.Protected())
	invoices.Get("/", middleware.RoleGuard("super", "admin", "officer"), handlers.GetAllInvoices)
	invoices.Post("/generate", middleware.RoleGuard("super", "admin", "officer"), handlers.GenerateInvoices)
	invoices.Post("/custom", middleware.RoleGuard("super", "admin", "officer"), handlers.GenerateCustomInvoices)
	
	// Invoice Management
	admin.Put("/invoices/:id", handlers.EditInvoice)
	admin.Delete("/invoices/:id", handlers.DeleteInvoice)
	
	// Reports
	admin.Get("/reports/payments", handlers.GetPaymentReports)

	// Discounts
	admin.Get("/discounts", handlers.GetStudentDiscounts)
	admin.Post("/discounts", handlers.AddStudentDiscount)
	admin.Delete("/discounts/:id", handlers.DeleteStudentDiscount)
	
	// Reminders
	admin.Get("/reminders/messages", handlers.GetReminderMessages)
	admin.Post("/reminders/messages", handlers.AddReminderMessage)
	admin.Put("/reminders/messages/:id", handlers.UpdateReminderMessage)
	admin.Delete("/reminders/messages/:id", handlers.DeleteReminderMessage)
	
	admin.Get("/reminders/schedules", handlers.GetReminderSchedules)
	admin.Post("/reminders/schedules", handlers.SaveReminderSchedule)
	admin.Put("/reminders/schedules/:id", handlers.UpdateReminderSchedule)
	admin.Delete("/reminders/schedules/:id", handlers.DeleteReminderSchedule)
	
	admin.Post("/reminders/trigger", handlers.TriggerSendReminders)

	// Payments
	api.Post("/payments/:id/approve", middleware.Protected(), middleware.RoleGuard("super", "admin", "officer"), handlers.ApprovePayment)
	api.Post("/payments/upload", handlers.UploadPaymentSlip)

	// Duty Management
	admin.Get("/duties", handlers.GetAdminDuties)
	admin.Post("/duties", handlers.AssignDuty)
	admin.Delete("/duties/:id", handlers.DeleteDuty)

	// Teacher Portal
	teacher := api.Group("/teacher", middleware.Protected(), middleware.RoleGuard("super", "admin", "teacher"))
	teacher.Get("/dashboard", handlers.GetTeacherDashboard)

	// Webhook (Unprotected - Called by Bank)
	api.Post("/webhook/payment", handlers.WebhookPayment)
}
