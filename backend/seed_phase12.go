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

	fmt.Println("Seeding data for Phase 12 (Lesson Plans)...")

	var teacher models.Admin
	db.Where("role = ?", "teacher").First(&teacher)

	if teacher.ID == 0 {
		log.Fatal("Need at least 1 teacher to seed Phase 12")
	}

	plans := []models.LessonPlan{
		{
			TeacherID: teacher.ID,
			Title:     "Week 1: Introduction to Algebra",
			Subject:   "Math Year 5",
			WeekOf:    "2026-08-01",
			Status:    "Approved",
			Feedback:  "Looks great! Clear objectives.",
			FilePath:  "/uploads/mock_plan_1.pdf",
		},
		{
			TeacherID: teacher.ID,
			Title:     "Week 2: Advanced Equations",
			Subject:   "Math Year 5",
			WeekOf:    "2026-08-08",
			Status:    "Needs Revision",
			Feedback:  "Please add more visual examples for the students.",
			FilePath:  "/uploads/mock_plan_2.pdf",
		},
		{
			TeacherID: teacher.ID,
			Title:     "Week 3: Geometry Basics",
			Subject:   "Math Year 5",
			WeekOf:    "2026-08-15",
			Status:    "Pending",
			Feedback:  "",
			FilePath:  "/uploads/mock_plan_3.pdf",
		},
	}

	for _, p := range plans {
		db.Where("title = ? AND teacher_id = ?", p.Title, p.TeacherID).FirstOrCreate(&p, p)
	}

	fmt.Println("Phase 12 Mock Data Seeded Successfully! 📝👨‍🏫")
}
