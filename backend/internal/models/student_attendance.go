package models

import "time"

// StudentAttendance represents a student's daily attendance
type StudentAttendance struct {
	ID         int       `gorm:"primaryKey;column:id" json:"id"`
	StudentID  int       `gorm:"column:student_id" json:"student_id"`
	SemesterID int       `gorm:"column:semester_id" json:"semester_id"`
	CheckDate  string    `gorm:"column:check_date" json:"check_date"`
	Status     string    `gorm:"column:status" json:"status"` // 'Present', 'Absent', 'Late'
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
}

func (StudentAttendance) TableName() string {
	return "student_attendance"
}
