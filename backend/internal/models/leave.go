package models

import (
	"time"

	"gorm.io/gorm"
)

// StudentLeave represents a leave request for a student
type StudentLeave struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	StudentID int            `gorm:"column:student_id;index" json:"student_id"`
	Student   *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	LeaveType string         `gorm:"column:leave_type" json:"leave_type"` // e.g., "Sick", "Personal"
	StartDate string         `gorm:"column:start_date;type:date" json:"start_date"`
	EndDate   string         `gorm:"column:end_date;type:date" json:"end_date"`
	Reason    string         `gorm:"column:reason;type:text" json:"reason"`
	Status    string         `gorm:"column:status;default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (StudentLeave) TableName() string {
	return "student_leave"
}
