package models

import (
	"time"

	"gorm.io/gorm"
)

// LessonPlan represents a teacher's lesson plan submission
type LessonPlan struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	TeacherID int            `gorm:"column:teacher_id;not null" json:"teacher_id"`
	Title     string         `gorm:"column:title" json:"title"`
	Subject   string         `gorm:"column:subject" json:"subject"`
	WeekOf    string         `gorm:"column:week_of" json:"week_of"` // e.g., "2026-08-17"
	Status    string         `gorm:"column:status;default:'Pending'" json:"status"` // 'Pending', 'Approved', 'Needs Revision'
	Feedback  string         `gorm:"column:feedback" json:"feedback"`
	FilePath  string         `gorm:"column:file_path" json:"file_path"` // Dummy path to PDF
	Teacher   *Admin         `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (LessonPlan) TableName() string {
	return "lesson_plans"
}
