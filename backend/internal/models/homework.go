package models

import "time"

// Homework represents the homework table
type Homework struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	SemesterID  int       `gorm:"column:semester_id" json:"semester_id"` // Term
	AdminID     int       `gorm:"column:admin_id" json:"admin_id"`       // Teacher
	YearID      int       `gorm:"column:year_id" json:"year_id"`         // Class
	SubjectID   int       `gorm:"column:subject_id" json:"subject_id"`   // Subject
	DateSet     string    `gorm:"column:date_set" json:"date_set"`
	DateDue     string    `gorm:"column:date_due" json:"date_due"`
	Description string    `gorm:"column:description" json:"description"`
	Attachment  string    `gorm:"column:attachment" json:"attachment"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`

	// Relationships
	Semester Semester `gorm:"foreignKey:SemesterID" json:"semester,omitempty"`
	Teacher  Admin    `gorm:"foreignKey:AdminID" json:"teacher,omitempty"`
	Year     Year     `gorm:"foreignKey:YearID" json:"year,omitempty"`
	Subject  Subject  `gorm:"foreignKey:SubjectID" json:"subject,omitempty"`
}

// TableName overrides the table name used by Homework to `homework`
func (Homework) TableName() string {
	return "homework"
}
