package models

import (
	"time"

	"gorm.io/gorm"
)

// MonthlyEvaluation represents a teacher's evaluation of a student for a specific month
type MonthlyEvaluation struct {
	ID             int            `gorm:"primaryKey;column:id" json:"id"`
	StudentID      int            `gorm:"column:student_id;not null" json:"student_id"`
	TeacherID      int            `gorm:"column:teacher_id;not null" json:"teacher_id"`
	MonthYear      string         `gorm:"column:month_year" json:"month_year"` // format "YYYY-MM"
	AcademicScore  string         `gorm:"column:academic_score" json:"academic_score"` // "Excellent", "Good", "Needs Improvement"
	BehaviorScore  string         `gorm:"column:behavior_score" json:"behavior_score"` // "Excellent", "Good", "Needs Improvement"
	SocialScore    string         `gorm:"column:social_score" json:"social_score"`     // "Excellent", "Good", "Needs Improvement"
	TeacherComment string         `gorm:"column:teacher_comment" json:"teacher_comment"`
	Student        *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Teacher        *Admin         `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
	CreatedAt      time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (MonthlyEvaluation) TableName() string {
	return "monthly_evaluations"
}
