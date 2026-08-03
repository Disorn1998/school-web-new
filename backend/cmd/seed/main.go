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

	// Make sure tables exist
	db.AutoMigrate(&models.Parent{}, &models.Student{}, &models.Attendance{})

	fmt.Println("Seeding 100 Parents and 100 Students...")
	
	rand.Seed(time.Now().UnixNano())

	firstNames := []string{"Somchai", "Somsri", "Mana", "Manee", "Piti", "Chujai", "Weera", "Anong", "Kitti", "Nipa", "Arisara", "Benyapa", "Chanon", "Danai", "Ekapol", "Fahsai", "Ganya", "Hathai", "Isara", "Jariya", "Kamon", "Laddawan"}
	lastNames := []string{"Jaidee", "Rakchat", "Maneewong", "Srisuk", "Thongkam", "Boonma", "Wongsa", "Charoensuk", "Panya", "Sukdee", "Saetang", "Saekhow", "Saengsuwan", "Intara", "Pongsatorn"}

	yearID := 1
	var newStudents []models.Student

	for i := 1; i <= 100; i++ {
		// 1. Create Parent
		pFirstName := firstNames[rand.Intn(len(firstNames))]
		pLastName := lastNames[rand.Intn(len(lastNames))]
		
		parent := models.Parent{
			Username:        fmt.Sprintf("parent%d", i+1000), // to avoid collision with existing if any
			Password:        "password123",
			FatherFirstname: pFirstName,
			FatherLastname:  pLastName,
			FatherPhone:     fmt.Sprintf("08%08d", rand.Intn(99999999)),
			Status:          "active",
		}
		
		if err := db.Create(&parent).Error; err != nil {
			log.Printf("Failed to create parent %d: %v", i, err)
			continue
		}

		// 2. Create Student
		sFirstName := firstNames[rand.Intn(len(firstNames))]
		sLastName := pLastName // same last name as parent
		
		student := models.Student{
			StudentID: fmt.Sprintf("STU%04d", i+1000),
			ParentID:  parent.ID,
			YearID:    yearID,
			Fullname:  fmt.Sprintf("%s %s", sFirstName, sLastName),
			Nickname:  fmt.Sprintf("Nick%d", i),
			Status:    "active",
			Gender:    "Not Specified",
		}

		if err := db.Create(&student).Error; err != nil {
			log.Printf("Failed to create student %d: %v", i, err)
			continue
		}
		
		newStudents = append(newStudents, student)
		
		// Cycle Year ID from 1 to 6
		yearID++
		if yearID > 6 {
			yearID = 1
		}
	}

	fmt.Println("Seeding Attendance records for 1 year (2026)...")

	startDate := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)
	
	// Create attendances in batches for performance
	var attendances []models.Attendance
	
	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		// Skip weekends (optional, but realistic for schools)
		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
			continue
		}
		
		dateStr := d.Format("2006-01-02")
		
		for _, s := range newStudents {
			r := rand.Float32()
			status := "ontime"
			if r > 0.95 {
				status = "absent"
			} else if r > 0.90 {
				status = "late"
			}
			
			lateMinutes := 0
			if status == "late" {
				lateMinutes = rand.Intn(30) + 1
			}

			att := models.Attendance{
				UserID:      s.ID,
				WorkDate:    dateStr,
				CheckIn:     "08:00:00",
				Status:      status,
				LateMinutes: lateMinutes,
			}
			attendances = append(attendances, att)
		}
	}
	
	// Batch Insert
	fmt.Printf("Inserting %d attendance records...\n", len(attendances))
	batchSize := 1000
	for i := 0; i < len(attendances); i += batchSize {
		end := i + batchSize
		if end > len(attendances) {
			end = len(attendances)
		}
		if err := db.CreateInBatches(attendances[i:end], batchSize).Error; err != nil {
			log.Printf("Batch insert error: %v", err)
		}
	}

	fmt.Println("Database Seeding Completed Successfully!")
}
