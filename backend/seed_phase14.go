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

	fmt.Println("Seeding data for Phase 14 (Support Tickets)...")

	var student models.Student
	db.First(&student)

	tickets := []models.SupportTicket{
		{
			TicketNo:      fmt.Sprintf("TKT-%s-%04d", time.Now().Format("0601"), 1),
			Title:         "Air conditioner in Grade 5/2 is leaking",
			Category:      "Facility",
			Description:   "Water is dripping from the air conditioner near the teacher's desk.",
			Priority:      "High",
			Status:        "In Progress",
			CreatedByID:   1, // Teacher or Admin ID
			CreatedByType: "Admin",
		},
		{
			TicketNo:      fmt.Sprintf("TKT-%s-%04d", time.Now().Format("0601"), 2),
			Title:         "Cannot access student portal",
			Category:      "IT",
			Description:   "My child forgot their password and cannot login to check homework.",
			Priority:      "Medium",
			Status:        "Open",
			CreatedByID:   student.ID,
			CreatedByType: "Student",
		},
	}

	for _, t := range tickets {
		db.Where("title = ?", t.Title).FirstOrCreate(&t, t)
	}

	fmt.Println("Phase 14 Mock Data Seeded Successfully! 🔧")
}
