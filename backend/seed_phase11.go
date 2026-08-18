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

	fmt.Println("Seeding data for Phase 11 (Health & Evaluation)...")

	// Get a student and a teacher
	var student models.Student
	var teacher models.Admin

	db.First(&student)
	db.Where("role = ?", "teacher").First(&teacher)

	if student.ID == 0 || teacher.ID == 0 {
		log.Fatal("Need at least 1 student and 1 teacher to seed Phase 11")
	}

	// 1. Health Record
	record := models.HealthRecord{
		StudentID:          student.ID,
		BloodType:          "O",
		WeightKg:           45.5,
		HeightCm:           152.0,
		Allergies:          "Peanuts, Dust",
		UnderlyingDiseases: "Asthma",
		EmergencyContact:   "081-234-5678 (Mother)",
	}
	db.Where("student_id = ?", student.ID).FirstOrCreate(&record, record)

	// 2. Health Incident
	incident := models.HealthIncident{
		StudentID:    student.ID,
		ReporterID:   teacher.ID,
		IncidentDate: time.Now().AddDate(0, 0, -2).Format("2006-01-02"), // 2 days ago
		IncidentType: "Sickness",
		Severity:     "Medium",
		Description:  "Fever and coughing during math class.",
		ActionTaken:  "Sent to nurse, took paracetamol, called parent to pick up.",
	}
	db.Where("student_id = ? AND description = ?", student.ID, incident.Description).FirstOrCreate(&incident, incident)

	// 3. Monthly Evaluation
	eval := models.MonthlyEvaluation{
		StudentID:      student.ID,
		TeacherID:      teacher.ID,
		MonthYear:      time.Now().Format("2006-01"),
		AcademicScore:  "Good",
		BehaviorScore:  "Excellent",
		SocialScore:    "Good",
		TeacherComment: "Participates well in class but needs to improve focus during afternoon sessions. Very helpful to friends.",
	}
	db.Where("student_id = ? AND month_year = ?", student.ID, eval.MonthYear).FirstOrCreate(&eval, eval)

	fmt.Println("Phase 11 Mock Data Seeded Successfully! 🩺🏆")
}
