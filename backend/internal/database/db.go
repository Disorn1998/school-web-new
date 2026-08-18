package database

import (
	"log"

	"backend/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// ConnectDB connects to the SQLite database and assigns it to the DB variable
func ConnectDB() {
	// Use pure Go SQLite instead of Postgres for local testing (No CGO required)
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Database Connection Failed: ", err)
	}

	DB = db
	log.Println("Connected to the SQLite Database Successfully")

	// Auto Migrate the schemas so tables are created automatically
	log.Println("Migrating database schemas...")
	err = db.AutoMigrate(
		&models.Admin{},
		&models.Student{},
		&models.Parent{},
		&models.Attendance{},
		&models.Year{},
		&models.Subject{},
		&models.Homework{},
		&models.Semester{},
		&models.Invoice{},
		&models.InvoiceItem{},
		&models.TeacherProfile{},
		&models.AuditLog{},
		&models.LoginAttempt{},
		&models.LoginHistory{},
		&models.TuitionFee{},
		&models.InvoiceHeader{},
		&models.Invoice{},
		&models.InvoiceItem{},
		&models.Payment{},
		&models.StudentDiscount{},
		&models.ReminderMessage{},
		&models.ReminderSchedule{},
	)

	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	} else {
		log.Println("Database migrated successfully.")
	}

	// Seed Mock Data for Portfolio Demo Mode
	SeedMockData()
}
