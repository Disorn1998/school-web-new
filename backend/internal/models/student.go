package models

import "time"

// Student represents the students table in the database
type Student struct {
	ID           int       `gorm:"primaryKey;column:id" json:"id"`
	StudentID    string    `gorm:"column:student_id" json:"student_id"`
	ParentID     int       `gorm:"column:parent_id" json:"parent_id"`
	YearID       int       `gorm:"column:year_id" json:"year_id"`
	Fullname     string    `gorm:"column:fullname" json:"fullname"`
	Nickname     string    `gorm:"column:nickname" json:"nickname"`
	ProfileImage string    `gorm:"column:profile_image;default:'default.png'" json:"profile_image"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relationships (GORM)
	Parent *Parent `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
}

// TableName overrides the table name used by Student to `students`
func (Student) TableName() string {
	return "students"
}
