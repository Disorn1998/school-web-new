package database

import (
	"log"
	"time"

	"backend/internal/models"

	"golang.org/x/crypto/bcrypt"
)

// SeedMockData drops all tables, auto-migrates, and seeds the database with mock data.
func SeedMockData() {
	log.Println("Starting Demo Seeder...")

	// 1. Password Hashing
	hashedPasswordBytes, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	hashedPassword := string(hashedPasswordBytes)

	// 2. Clear Database (We don't actually drop tables here, just create if empty.
	// We handle table dropping in the ResetDemoDB handler before calling this)
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded. Skipping seeder.")
		return
	}

	// 3. Seed Admins
	admin := models.Admin{
		Username:     "admin",
		PasswordHash: hashedPassword,
		Role:         "super",
		Email:        "admin@school.com",
		Name:         "System Administrator",
	}
	DB.Create(&admin)

	// 4. Seed Teachers
	teachers := []models.Admin{
		{Username: "teacher1", PasswordHash: hashedPassword, Role: "teacher", Name: "Kru Somsri", Email: "somsri@school.com"},
		{Username: "teacher2", PasswordHash: hashedPassword, Role: "teacher", Name: "Kru Mana", Email: "mana@school.com"},
		{Username: "teacher3", PasswordHash: hashedPassword, Role: "teacher", Name: "Kru Piti", Email: "piti@school.com"},
	}
	for i := range teachers {
		DB.Create(&teachers[i])
		profile := models.TeacherProfile{
			AdminID: teachers[i].ID,
			Profile: "A highly experienced teacher.",
		}
		DB.Create(&profile)
	}

	// 5. Seed Parents & Students
	// Year & Semester must be created first for students
	year := models.Year{YearName: "M.1", Level: "Secondary"}
	DB.Create(&year)

	sem := models.Semester{
		SemesterName:       "Semester 1",
		AcademicYear:       "2026",
		StartDate:          time.Now().Add(-30 * 24 * time.Hour).Format("2006-01-02"),
		EndDate:            time.Now().Add(100 * 24 * time.Hour).Format("2006-01-02"),
		Status:             "ACTIVE",
		NumberOfSchoolDays: 100,
	}
	DB.Create(&sem)

	for i := 1; i <= 10; i++ {
		parent := models.Parent{
			Username:        "parent" + string(rune(48+i)), // e.g., parent1
			Password:        hashedPassword,
			FatherFirstname: "Parent",
			FatherLastname:  "of Student " + string(rune(48+i)),
			FatherPhone:     "081234567" + string(rune(48+i%10)),
			FatherEmail:     "parent" + string(rune(48+i)) + "@school.com",
		}
		if i == 10 {
			parent.Username = "parent10"
		}
		DB.Create(&parent)

		student := models.Student{
			StudentUUID: "STU-UUID-" + string(rune(48+i)),
			StudentID:   "STU2026" + string(rune(48+i)),
			ParentID:    parent.ID,
			YearID:      year.ID,
			Fullname:    "Dekchai Jai-Dee " + string(rune(48+i)),
			Nickname:    "Boy",
			Email:       "student" + string(rune(48+i)) + "@school.com",
			Status:      "active",
		}
		if i == 10 {
			student.StudentUUID = "STU-UUID-10"
			student.StudentID = "STU202610"
		}
		DB.Create(&student)
	}

	// 7. Seed Subjects
	subjects := []models.Subject{
		{SubjectName: "Mathematics M.1"},
		{SubjectName: "Science M.1"},
		{SubjectName: "English M.1"},
	}
	for _, s := range subjects {
		DB.Create(&s)
	}

	log.Println("Demo Data Seeded Successfully!")
}
