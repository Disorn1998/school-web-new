package models

import (
	"time"
)

// TestScoreHeader represents an assessment event (like a test or homework)
type TestScoreHeader struct {
	ID         int       `gorm:"primaryKey;column:id" json:"id"`
	SemesterID int       `gorm:"column:semester_id" json:"semester_id"`
	SubjectID  int       `gorm:"column:subject_id" json:"subject_id"`
	YearID     int       `gorm:"column:year_id" json:"year_id"`
	ReportName string    `gorm:"column:report_name" json:"report_name"` // e.g., 'EXAMINATION', 'Effort & Participation', 'Midterm'
	TestDate   string    `gorm:"column:test_date" json:"test_date"`
	FullScore  float64   `gorm:"column:full_score" json:"full_score"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`

	// Relationships
	Semester *Semester `gorm:"foreignKey:SemesterID" json:"semester,omitempty"`
	Subject  *Subject  `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
	Year     *Year     `gorm:"foreignKey:YearID" json:"year,omitempty"`
}

// TableName overrides the table name
func (TestScoreHeader) TableName() string {
	return "test_scores_header"
}

// TestScoreDetail represents a student's score for a specific assessment
type TestScoreDetail struct {
	ID        int     `gorm:"primaryKey;column:id" json:"id"`
	HeaderID  int     `gorm:"column:header_id" json:"header_id"`
	StudentID int     `gorm:"column:student_id" json:"student_id"`
	Score     float64 `gorm:"column:score" json:"score"`
	Comment   string  `gorm:"column:comment" json:"comment"`
	FilePath  string  `gorm:"column:file_path" json:"file_path"`

	// Relationships
	Header  *TestScoreHeader `gorm:"foreignKey:HeaderID" json:"header,omitempty"`
	Student *Student         `gorm:"foreignKey:StudentID" json:"student,omitempty"`
}

// TableName overrides the table name
func (TestScoreDetail) TableName() string {
	return "test_scores_details"
}
