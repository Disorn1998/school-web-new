package main

import (
	"backend/internal/models"
	"fmt"
	"log"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Seeding data for Phase 15 (Admissions)...")

	apps := []models.AdmissionApplication{
		{
			ApplicationNo:    fmt.Sprintf("APP-%s-0001", time.Now().Format("2006")),
			StudentFirstName: "Alice",
			StudentLastName:  "Smith",
			DateOfBirth:      "2018-05-10",
			GradeApplying:    "Grade 1",
			ParentName:       "Bob Smith",
			ParentEmail:      "bob@smith.com",
			ParentPhone:      "+66812345678",
			Status:           "Pending",
			Notes:            "Needs school bus service.",
		},
		{
			ApplicationNo:    fmt.Sprintf("APP-%s-0002", time.Now().Format("2006")),
			StudentFirstName: "John",
			StudentLastName:  "Doe",
			DateOfBirth:      "2015-08-20",
			GradeApplying:    "Grade 4",
			ParentName:       "Jane Doe",
			ParentEmail:      "jane@doe.com",
			ParentPhone:      "+66912345678",
			Status:           "Accepted",
			Notes:            "Excellent math scores from previous school.",
		},
	}

	for _, app := range apps {
		db.Where("student_first_name = ?", app.StudentFirstName).FirstOrCreate(&app, app)
	}

	fmt.Println("Phase 15 Mock Data Seeded Successfully! 🎓")
}
