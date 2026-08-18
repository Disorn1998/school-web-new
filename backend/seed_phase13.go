package main

import (
	"backend/internal/models"
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Seeding data for Phase 13 (Support Classes)...")

	classes := []models.SupportClass{
		{
			Title:       "Summer English Camp 2026",
			Description: "Improve English speaking skills with native teachers. Fun games and activities!",
			Schedule:    "March 1 - March 15 (Mon-Fri 09:00 - 12:00)",
			Price:       4500.0,
			Capacity:    25,
		},
		{
			Title:       "Intensive Math for Year 5",
			Description: "Advanced math tutoring for students preparing for external competitions.",
			Schedule:    "Every Saturday (13:00 - 15:00)",
			Price:       2500.0,
			Capacity:    15,
		},
		{
			Title:       "Beginner Robotics Workshop",
			Description: "Learn to build and program basic robots using Lego Mindstorms.",
			Schedule:    "March 20 - March 24 (Mon-Fri 13:00 - 16:00)",
			Price:       6000.0,
			Capacity:    20,
		},
	}

	for _, c := range classes {
		db.Where("title = ?", c.Title).FirstOrCreate(&c, c)
	}

	var student models.Student
	db.First(&student)

	var class models.SupportClass
	db.Where("title = ?", "Summer English Camp 2026").First(&class)

	if student.ID != 0 && class.ID != 0 {
		enrollment := models.ClassEnrollment{
			StudentID:      student.ID,
			SupportClassID: class.ID,
			Status:         "Pending Payment",
		}
		db.Where("student_id = ? AND support_class_id = ?", student.ID, class.ID).FirstOrCreate(&enrollment, enrollment)
	}

	fmt.Println("Phase 13 Mock Data Seeded Successfully! ☀️")
}
