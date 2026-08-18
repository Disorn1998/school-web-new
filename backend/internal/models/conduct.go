package models

import "time"

// ConductScoreHeader represents a conduct evaluation event (usually end of semester)
type ConductScoreHeader struct {
	ID             int       `gorm:"primaryKey;column:id" json:"id"`
	SemesterID     int       `gorm:"column:semester_id" json:"semester_id"`
	YearID         int       `gorm:"column:year_id" json:"year_id"`
	TeacherID      int       `gorm:"column:teacher_id" json:"teacher_id"`
	EvaluationDate string    `gorm:"column:evaluation_date" json:"evaluation_date"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`

	// Relationships
	Semester *Semester `gorm:"foreignKey:SemesterID" json:"semester,omitempty"`
	Year     *Year     `gorm:"foreignKey:YearID" json:"year,omitempty"`
	Teacher  *Admin    `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
}

func (ConductScoreHeader) TableName() string {
	return "conduct_scores_header"
}

// ConductCategory represents the behavior topics to be evaluated
type ConductCategory struct {
	ID        int    `gorm:"primaryKey;column:id" json:"id"`
	Category  string `gorm:"column:category" json:"category"`
	Type      string `gorm:"column:type" json:"type"` // e.g., 'PERSONAL DEVELOPMENT', 'SOCIAL DEVELOPMENT'
	SortOrder int    `gorm:"column:sort_order" json:"sort_order"`
}

func (ConductCategory) TableName() string {
	return "conduct_category"
}

// ConductScoreDetail represents a student's score (1-4) for a specific category
type ConductScoreDetail struct {
	ID         int `gorm:"primaryKey;column:id" json:"id"`
	HeaderID   int `gorm:"column:header_id" json:"header_id"`
	StudentID  int `gorm:"column:student_id" json:"student_id"`
	CategoryID int `gorm:"column:category_id" json:"category_id"`
	Score      int `gorm:"column:score" json:"score"` // 1-4

	// Relationships
	Header   *ConductScoreHeader `gorm:"foreignKey:HeaderID" json:"header,omitempty"`
	Student  *Student            `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Category *ConductCategory    `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (ConductScoreDetail) TableName() string {
	return "conduct_scores_details"
}

// ConductGeneralComment holds the overall behavior comment from the homeroom teacher
type ConductGeneralComment struct {
	ID             int    `gorm:"primaryKey;column:id" json:"id"`
	HeaderID       int    `gorm:"column:header_id" json:"header_id"`
	StudentID      int    `gorm:"column:student_id" json:"student_id"`
	GeneralComment string `gorm:"column:general_comment" json:"general_comment"`

	// Relationships
	Header  *ConductScoreHeader `gorm:"foreignKey:HeaderID" json:"header,omitempty"`
	Student *Student            `gorm:"foreignKey:StudentID" json:"student,omitempty"`
}

func (ConductGeneralComment) TableName() string {
	return "conduct_general_comments"
}
