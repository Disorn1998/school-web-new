package models

import "time"

// LessonMaterial represents the lesson plans/materials (matching legacy `lesson_materials` table)
type LessonMaterial struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	YearID      int       `gorm:"column:year_id" json:"year_id"`
	SubjectID   int       `gorm:"column:subject_id" json:"subject_id"`
	Title       string    `gorm:"column:title" json:"title"`
	FileURL     string    `gorm:"column:file_url" json:"file_url"`         // E.g. /materials/xxx.pdf
	ExternalURL string    `gorm:"column:external_url" json:"external_url"` // E.g. YouTube link
	LessonDate  string    `gorm:"column:lesson_date;type:date" json:"lesson_date"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`

	// Relationships
	Year    Year    `gorm:"foreignKey:YearID" json:"year,omitempty"`
	Subject Subject `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
}

// TableName overrides the table name
func (LessonMaterial) TableName() string {
	return "lesson_materials"
}
