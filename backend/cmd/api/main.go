package main

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/models"
	"backend/internal/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading it")
	}

	// Connect to Database
	database.ConnectDB()

	// Auto Migrate
	database.DB.AutoMigrate(
		&models.Admin{},
		&models.Student{},
		&models.Parent{},
		&models.Semester{},
		&models.Year{},
		&models.TuitionFee{},
		&models.Subject{},
		&models.InvoiceHeader{},
		&models.InvoiceItem{},
		&models.Homework{},
		&models.TeacherProfile{},
		&models.LoginAttempt{},
		&models.LoginHistory{},
		&models.DutyDay{},
		&models.DutyTimeSlot{},
		&models.DutyArea{},
		&models.DutyAssignment{},
		&models.StudentLeave{},
		&models.StudentAttendance{},
		&models.TestScoreHeader{},
		&models.TestScoreDetail{},
		&models.Homework{},
		&models.LessonMaterial{},
		&models.ConductScoreHeader{},
		&models.ConductCategory{},
		&models.ConductScoreDetail{},
		&models.ConductGeneralComment{},
		&models.Timetable{},
		&models.ECA{},
		&models.ECAEnrollment{},
		&models.SchoolBusRoute{},
		&models.SchoolBusRegistration{},
		&models.LibraryCategory{},
		&models.LibraryBook{},
		&models.BookBorrowing{},
		&models.HealthRecord{},
		&models.HealthIncident{},
		&models.MonthlyEvaluation{},
		&models.LessonPlan{},
		&models.SupportClass{},
		&models.ClassEnrollment{},
		&models.SupportTicket{},
		&models.AdmissionApplication{},
		&models.ShopCategory{},
		&models.ShopItem{},
		&models.ShopOrder{},
		&models.ShopOrderItem{},
	)

	// Seed meta data for Duty
	handlers.InitDutyMetaData()

	app := fiber.New()

	// Enable CORS for frontend connection
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Setup application routes
	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}
