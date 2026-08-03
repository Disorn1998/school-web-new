package main

import (
	"backend/internal/models"
	"fmt"
	"log"
	"math/rand"
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

	fmt.Println("Updating existing 100 Parents with rich mock data...")
	rand.Seed(time.Now().UnixNano())

	motherFirstNames := []string{"Siriporn", "Wandee", "Sudarat", "Pimchanok", "Jiraporn", "Kanchana", "Pornthip", "Ratana", "Supaporn"}
	cities := []string{"Bangkok", "Nonthaburi", "Pathum Thani", "Samut Prakan"}
	foodLimits := []string{"None", "None", "None", "Allergic to Peanuts", "No Pork (Halal)", "Vegetarian", "Allergic to Seafood"}
	healthLimits := []string{"None", "None", "None", "Asthma", "Mild dust allergy", "ADHD"}

	var parents []models.Parent
	if err := db.Find(&parents).Error; err != nil {
		log.Fatal("Failed to fetch parents")
	}

	for _, p := range parents {
		mName := motherFirstNames[rand.Intn(len(motherFirstNames))]
		p.MotherFirstname = mName
		p.MotherLastname = p.FatherLastname
		p.MotherPhone = fmt.Sprintf("08%08d", rand.Intn(99999999))
		p.MotherEmail = fmt.Sprintf("mother_%s@example.com", mName)
		
		p.AddressLine1 = fmt.Sprintf("%d/%d Moo %d, Soi Sukhumvit %d", rand.Intn(200)+1, rand.Intn(50)+1, rand.Intn(10)+1, rand.Intn(100)+1)
		p.City = "Bangkok"
		p.Province = cities[rand.Intn(len(cities))]
		p.Postcode = fmt.Sprintf("10%03d", rand.Intn(999))
		p.Country = "Thailand"
		
		p.InvoiceTarget = "Father"
		if rand.Float32() > 0.5 {
			p.InvoiceTarget = "Mother"
		}

		db.Save(&p)
	}

	fmt.Println("Updating existing 100 Students with rich mock data...")
	
	var students []models.Student
	if err := db.Find(&students).Error; err != nil {
		log.Fatal("Failed to fetch students")
	}

	for _, s := range students {
		// Gen random birthdate between 2010 and 2018
		year := 2010 + rand.Intn(9)
		month := rand.Intn(12) + 1
		day := rand.Intn(28) + 1
		s.DateOfBirth = fmt.Sprintf("%04d-%02d-%02d", year, month, day)
		
		s.Gender = "Male"
		if rand.Float32() > 0.5 {
			s.Gender = "Female"
		}
		
		s.Nationality = "Thai"
		if rand.Float32() > 0.9 {
			s.Nationality = "American"
		}
		
		s.FoodLimitations = foodLimits[rand.Intn(len(foodLimits))]
		s.HealthLimitations = healthLimits[rand.Intn(len(healthLimits))]
		s.EnrollmentYear = year + 6
		s.Email = fmt.Sprintf("%s@student.school.edu", s.StudentID)
		
		db.Save(&s)
	}

	fmt.Println("Rich mock data updated successfully!")
}
