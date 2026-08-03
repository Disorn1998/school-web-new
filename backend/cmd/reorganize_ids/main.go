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
	fmt.Println("Connecting to database...")
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	fmt.Println("Reorganizing Parent Usernames (PRT2026xxxx)...")
	var parents []models.Parent
	if err := db.Order("id asc").Find(&parents).Error; err != nil {
		log.Fatal("Failed to fetch parents")
	}

	currentYear := time.Now().Year()

	// Update Parents
	for i, p := range parents {
		newUsername := fmt.Sprintf("PRT%d%04d", currentYear, i+1)
		db.Model(&p).Update("username", newUsername)
	}

	fmt.Println("Reorganizing Student IDs (STU2026xxxx)...")
	var students []models.Student
	if err := db.Order("id asc").Find(&students).Error; err != nil {
		log.Fatal("Failed to fetch students")
	}

	// Update Students
	for i, s := range students {
		newStudentID := fmt.Sprintf("STU%d%04d", currentYear, i+1)
		db.Model(&s).Update("student_id", newStudentID)
	}

	// Update emails to match new official IDs
	for _, s := range students {
		var freshStudent models.Student
		db.First(&freshStudent, s.ID)
		newEmail := fmt.Sprintf("%s@student.school.edu", freshStudent.StudentID)
		db.Model(&freshStudent).Update("email", newEmail)
	}

	fmt.Println("Database Reorganization Completed Successfully! All IDs are now perfectly sequential.")
}
