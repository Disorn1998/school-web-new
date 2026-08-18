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

	// Demo Reset Route (Public for Portfolio)
	api.Post("/demo/reset", handlers.ResetDemoDB)

	// Admin Routes (Testing only)
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

	// Admin & Teacher Protected Routes
	adminRoutes := api.Group("/admin", middleware.RoleGuard("super", "officer", "teacher"))

	// Student Management
	adminRoutes.Get("/students", handlers.GetAllStudents) 
	adminRoutes.Get("/students/:id", handlers.GetStudent) 
	
	admin.Post("/students/import", handlers.ImportStudentsCSV)
	admin.Get("/students/export", handlers.ExportStudentsCSV)
	admin.Post("/students/promote", handlers.PromoteStudents) 
	
	admin.Post("/students", handlers.CreateStudent)
	admin.Put("/students/:id", handlers.UpdateStudent)
	admin.Delete("/students/:id", handlers.DeleteStudent)
	
	// Duty & Attendance
	adminRoutes.Get("/duties", handlers.GetAdminDuties)
	adminRoutes.Post("/duties", handlers.AssignDuty)
	adminRoutes.Delete("/duties/:id", handlers.DeleteDuty)
	
	adminRoutes.Get("/attendance/daily", handlers.GetDailyAttendance)
	adminRoutes.Get("/attendance/report", handlers.GetMonthlyReport)
	adminRoutes.Get("/attendance/report/yearly", handlers.GetYearlyReport)
	adminRoutes.Post("/attendance/manual", handlers.ManualCheckIn)
	adminRoutes.Post("/attendance/bulk", handlers.BulkCheckIn)
	adminRoutes.Get("/attendance/student/:id", handlers.GetStudentAttendance)
	
	// Phase 6: Homework
	adminRoutes.Get("/homework", handlers.GetTeacherHomeworks)
	adminRoutes.Post("/homework", handlers.CreateHomework)
	adminRoutes.Delete("/homework/:id", handlers.DeleteHomework)

	// Phase 6: Scores / Reports
	adminRoutes.Get("/scores", handlers.GetAssessments)
	adminRoutes.Post("/scores/header", handlers.CreateAssessment)
	adminRoutes.Get("/scores/details/:id", handlers.GetAssessmentScores)
	adminRoutes.Post("/scores/bulk/:id", handlers.SaveAssessmentScores)
	adminRoutes.Post("/scores/upload/:detail_id", handlers.UploadExamFile)

	// Phase 6: Lesson Plans
	adminRoutes.Get("/lesson-plans", handlers.GetTeacherLessonPlans)
	adminRoutes.Post("/lesson-plans", handlers.UploadLessonPlan)
	adminRoutes.Delete("/lesson-plans/:id", handlers.DeleteLessonPlan)

	// Phase 7: Conduct Reports
	adminRoutes.Get("/conduct", handlers.GetConductHeaders)
	adminRoutes.Post("/conduct/header", handlers.CreateConductHeader)
	adminRoutes.Get("/conduct/details/:id", handlers.GetConductDetails)
	adminRoutes.Post("/conduct/bulk/:id", handlers.SaveConductDetails)

	// Phase 8: Timetable
	adminRoutes.Get("/timetable", handlers.GetClassTimetable)
	adminRoutes.Post("/timetable/bulk", handlers.SaveClassTimetable)
	adminRoutes.Get("/timetable/teacher/:id", handlers.GetTeacherTimetable)

	// Phase 8: ECAs
	adminRoutes.Get("/ecas", handlers.GetAllECAs)
	adminRoutes.Post("/ecas", handlers.CreateECA)

	// Phase 9: School Bus
	adminRoutes.Get("/schoolbus/routes", handlers.GetAllSchoolBusRoutes)
	adminRoutes.Post("/schoolbus/routes", handlers.CreateSchoolBusRoute)
	adminRoutes.Get("/schoolbus/registrations", handlers.GetSchoolBusRegistrations)

	// Phase 9: Leave Requests
	adminRoutes.Get("/leave", handlers.GetAllLeaveRequests)
	adminRoutes.Put("/leave/:id", handlers.UpdateLeaveStatus)

	// Phase 10: Library
	adminRoutes.Get("/library/categories", handlers.GetLibraryCategories)
	adminRoutes.Post("/library/categories", handlers.CreateLibraryCategory)
	adminRoutes.Get("/library/books", handlers.GetLibraryBooks)
	adminRoutes.Post("/library/books", handlers.CreateLibraryBook)
	adminRoutes.Get("/library/borrowings", handlers.GetBorrowings)
	adminRoutes.Post("/library/borrow", handlers.BorrowBook)
	adminRoutes.Put("/library/return/:id", handlers.ReturnBook)

	// Phase 11: Health & Evaluation
	adminRoutes.Get("/health/incidents", handlers.GetAllHealthIncidents)
	adminRoutes.Post("/health/incidents", handlers.CreateHealthIncident)
	adminRoutes.Get("/health/record/:id", handlers.GetStudentHealthRecord)
	adminRoutes.Post("/health/record", handlers.UpsertHealthRecord)
	
	adminRoutes.Get("/evaluation", handlers.GetAllEvaluations)
	adminRoutes.Post("/evaluation", handlers.CreateEvaluation)

	// Phase 12: Lesson Plans
	adminRoutes.Get("/lesson-plans", handlers.GetLessonPlans)
	adminRoutes.Post("/lesson-plans", handlers.CreateLessonPlan)
	adminRoutes.Put("/lesson-plans/:id/status", handlers.UpdateLessonPlanStatus)

	// Phase 13: Support Classes
	adminRoutes.Get("/support-classes", handlers.GetAllSupportClasses)
	adminRoutes.Post("/support-classes", handlers.CreateSupportClass)

	// Phase 14: Support Tickets
	adminRoutes.Get("/tickets", handlers.GetAllTickets)
	adminRoutes.Post("/tickets", handlers.CreateTicket)
	adminRoutes.Put("/tickets/:id/status", handlers.UpdateTicketStatus)

	// Phase 15: Admissions
	adminRoutes.Get("/admissions", handlers.GetAllAdmissions)
	adminRoutes.Put("/admissions/:id/status", handlers.UpdateAdmissionStatus)
	adminRoutes.Post("/admissions/:id/convert", handlers.ConvertToStudent)

	// Phase 16: Shop
	adminRoutes.Get("/shop/categories", handlers.GetShopCategories)
	adminRoutes.Post("/shop/categories", handlers.CreateShopCategory)
	adminRoutes.Get("/shop/items", handlers.GetShopItems)
	adminRoutes.Post("/shop/items", handlers.CreateShopItem)
	adminRoutes.Get("/shop/orders", handlers.GetShopOrders)

	// Public Routes (No Auth)
	api.Post("/public/admissions", handlers.SubmitAdmission)


	
	// Removed student ECA from here

	// Admin Only Routes (Super/Officer)
	adminOnlyRoutes := api.Group("/admin", middleware.RoleGuard("super", "officer"))
	adminOnlyRoutes.Get("/stats", handlers.GetDashboardStats)

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
	student.Get("/invoices", handlers.GetMyInvoices)
	
	// Phase 13: Support Classes
	student.Get("/support-classes", handlers.GetAllSupportClasses) // Student can see available classes
	student.Post("/support-classes/enroll", handlers.EnrollSupportClass)
	student.Get("/my-support-classes", handlers.GetStudentSupportClasses)

	// Phase 14: Support Tickets
	student.Get("/tickets", handlers.GetAllTickets)
	student.Post("/tickets", handlers.CreateTicket)

	// 16. School Shop
	student.Get("/shop/categories", handlers.GetShopCategories)
	student.Get("/shop/items", handlers.GetShopItems)
	student.Post("/shop/orders", handlers.PlaceShopOrder)
	student.Get("/shop/orders/me", handlers.GetStudentShopOrders)
	student.Get("/shop/orders/:id/qr", handlers.GenerateOrderQR)
	
	// Phase 6 & 7: Student Views (Also used by parents passing student ID)
	student.Get("/homework/:id", handlers.GetStudentHomeworks)
	student.Get("/academic-report/:id", handlers.GetStudentAcademicReport)
	student.Get("/conduct/:student_id", handlers.GetStudentConductReport)
	
	// Phase 8: Student ECA endpoints
	student.Get("/ecas", handlers.GetAllECAs)
	student.Get("/my-ecas", handlers.GetStudentECAs)
	student.Post("/ecas/enroll", handlers.EnrollStudentECA)

	// Phase 9: Student Bus & Leave endpoints
	student.Get("/schoolbus/routes", handlers.GetAllSchoolBusRoutes)
	student.Get("/schoolbus/registration/:id", handlers.GetStudentBusRegistration)
	student.Post("/schoolbus/register", handlers.RegisterStudentBus)
	
	student.Get("/leave/:id", handlers.GetStudentLeaveRequests)
	student.Post("/leave", handlers.SubmitLeaveRequest)

	// Phase 10: Student Library
	student.Get("/library/books", handlers.GetLibraryBooks)
	student.Get("/library/borrowings/:id", handlers.GetStudentBorrowings)

	// Phase 11: Student Health & Evaluation
	student.Get("/health/record/:id", handlers.GetStudentHealthRecord)
	student.Get("/health/incidents/:id", handlers.GetStudentHealthIncidents)
	student.Get("/evaluation/:id", handlers.GetStudentEvaluations)

	// === Phase 4: Academic & Operations ===

	// 4.1 Attendance
	api.Post("/attendance/checkin", middleware.Protected(), handlers.CheckIn)

	// 4.3 Invoices (Finance)
	invoices := api.Group("/invoices", middleware.Protected())
	invoices.Get("/", middleware.RoleGuard("super", "admin", "officer"), handlers.GetAllInvoices)
	invoices.Post("/generate", middleware.RoleGuard("super", "admin", "officer"), handlers.GenerateInvoices)
	invoices.Post("/custom", middleware.RoleGuard("super", "admin", "officer"), handlers.GenerateCustomInvoices)
	invoices.Get("/:id/qr", handlers.GenerateInvoiceQR) // QR Code Generation
	
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
