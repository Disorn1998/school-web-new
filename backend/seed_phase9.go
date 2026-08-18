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

	fmt.Println("Seeding data for Phase 8 & 9...")

	// 1. ECAs
	ecas := []models.ECA{
		{Name: "Football Club", Description: "Learn football skills", MaxCapacity: 20, DayOfWeek: 1, StartTime: "15:30", EndTime: "17:00", SemesterID: 1, Fee: 500, TeacherID: 1, IsActive: true},
		{Name: "Coding Club", Description: "Build cool apps", MaxCapacity: 15, DayOfWeek: 3, StartTime: "15:30", EndTime: "17:00", SemesterID: 1, Fee: 0, TeacherID: 1, IsActive: true},
		{Name: "Art & Craft", Description: "Creative painting", MaxCapacity: 12, DayOfWeek: 5, StartTime: "15:30", EndTime: "17:00", SemesterID: 1, Fee: 200, TeacherID: 1, IsActive: true},
	}
	for _, eca := range ecas {
		db.FirstOrCreate(&eca, models.ECA{Name: eca.Name})
	}

	// 2. School Bus Routes
	routes := []models.SchoolBusRoute{
		{RouteName: "Line 1: Sukhumvit", DriverName: "Uncle Bob", ContactInfo: "081-234-5678", LicensePlate: "1กข 1234", MaxCapacity: 12, MonthlyFee: 3500, Description: "Asok, Phrom Phong, Thong Lo, Ekkamai"},
		{RouteName: "Line 2: Silom", DriverName: "Uncle Tom", ContactInfo: "089-876-5432", LicensePlate: "2กค 9876", MaxCapacity: 12, MonthlyFee: 4000, Description: "Sala Daeng, Chong Nonsi, Surasak"},
		{RouteName: "Line 3: Ladprao", DriverName: "Mr. Chai", ContactInfo: "085-555-5555", LicensePlate: "3กง 5555", MaxCapacity: 12, MonthlyFee: 3000, Description: "Phahon Yothin, Ha Yaek, Chatuchak"},
	}
	for _, route := range routes {
		db.FirstOrCreate(&route, models.SchoolBusRoute{RouteName: route.RouteName})
	}

	// 3. Timetable for a specific class (Year 1)
	timetables := []models.Timetable{
		{SemesterID: 1, YearID: 1, DayOfWeek: 1, Period: 1, Subject: "Mathematics", TeacherID: 1, Room: "1/1"},
		{SemesterID: 1, YearID: 1, DayOfWeek: 1, Period: 2, Subject: "English", TeacherID: 1, Room: "1/1"},
		{SemesterID: 1, YearID: 1, DayOfWeek: 1, Period: 3, Subject: "Science", TeacherID: 1, Room: "1/1"},
		{SemesterID: 1, YearID: 1, DayOfWeek: 2, Period: 1, Subject: "Physical Education", TeacherID: 1, Room: "1/1"},
	}
	for _, tt := range timetables {
		db.FirstOrCreate(&tt, models.Timetable{Subject: tt.Subject, DayOfWeek: tt.DayOfWeek})
	}

	// 4. Example Leave Requests
	leaves := []models.StudentLeave{
		{StudentID: 1, LeaveType: "Sick", StartDate: "2026-08-20", EndDate: "2026-08-21", Reason: "High fever and coughing", Status: "PENDING"},
		{StudentID: 2, LeaveType: "Personal", StartDate: "2026-08-25", EndDate: "2026-08-25", Reason: "Family trip out of town", Status: "PENDING"},
	}
	for _, leave := range leaves {
		db.FirstOrCreate(&leave, models.StudentLeave{StudentID: leave.StudentID, Reason: leave.Reason})
	}

	fmt.Println("Mock Data Seeded Successfully! 🎉")
}
