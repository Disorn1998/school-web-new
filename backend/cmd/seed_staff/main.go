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

	// Auto migrate
	db.AutoMigrate(&models.Admin{}, &models.TeacherProfile{})

	fmt.Println("Seeding mock Teachers and Staff...")

	// Clear existing admins except id=2 and id=5 (from legacy, we might not have them but let's just add new ones)
	// Actually, let's just clear all for a clean slate, except if we want to keep the super admin for login.
	// For now, let's just add mock data if not exists.
	
	// Mock Data
	admins := []models.Admin{
		// Staff (officer)
		{Username: "anna", Fullname: "Anna Smith", Name: "Anna", Role: "officer", Email: "anna@school.edu", PassportName: "ANNA M SMITH", Photo: "default.png"},
		{Username: "peter", Fullname: "Peter Johnson", Name: "Peter", Role: "officer", Email: "peter@school.edu", PassportName: "PETER B JOHNSON", Photo: "default.png"},
		{Username: "maria", Fullname: "Maria Garcia", Name: "Maria", Role: "super", Email: "maria@school.edu", PassportName: "MARIA G GARCIA", Photo: "default.png"},
		
		// Teachers
		{Username: "john_t", Fullname: "John Doe", Name: "John", Role: "teacher", Email: "john.t@school.edu", PassportName: "JOHN A DOE", Photo: "default.png"},
		{Username: "sarah_t", Fullname: "Sarah Connor", Name: "Sarah", Role: "teacher", Email: "sarah.c@school.edu", PassportName: "SARAH CONNOR", Photo: "default.png"},
		{Username: "michael_t", Fullname: "Michael Scott", Name: "Michael", Role: "teacher", Email: "michael.s@school.edu", PassportName: "MICHAEL G SCOTT", Photo: "default.png"},
		{Username: "emily_t", Fullname: "Emily Davis", Name: "Emily", Role: "teacher", Email: "emily.d@school.edu", PassportName: "EMILY R DAVIS", Photo: "default.png"},
	}

	for _, a := range admins {
		// Check if exists
		var count int64
		db.Model(&models.Admin{}).Where("username = ?", a.Username).Count(&count)
		if count == 0 {
			a.CreatedAt = time.Now()
			a.UpdatedAt = time.Now()
			a.PasswordHash = "$2y$10$8hD6kDe5niwcZZrCZd.OdOm9FO.PVIl6QVoVH6CumxDZmmrLWKAxG" // 'password'
			
			if err := db.Create(&a).Error; err != nil {
				fmt.Println("Error creating admin:", err)
				continue
			}

			// Create profile if teacher
			if a.Role == "teacher" {
				profile := models.TeacherProfile{
					AdminID: a.ID,
					Profile: fmt.Sprintf("%s is a dedicated educator with over 10 years of experience in international schools. They focus on student-centered learning and critical thinking.", a.Fullname),
				}
				db.Create(&profile)
			}
			fmt.Printf("Created: %s (%s)\n", a.Fullname, a.Role)
		}
	}

	fmt.Println("Seeding complete!")
}
