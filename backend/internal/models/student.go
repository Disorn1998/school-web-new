package models

import (
	"time"

	"gorm.io/gorm"
)

// Student represents the students table in the database
type Student struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	StudentUUID string    `gorm:"column:student_uuid;unique" json:"student_uuid"`
	StudentID   string    `gorm:"column:student_id" json:"student_id"`
	ParentID    int       `gorm:"column:parent_id" json:"parent_id"`
	YearID      int       `gorm:"column:year_id" json:"year_id"`
	Fullname  string    `gorm:"column:fullname" json:"fullname"`
	Nickname  string    `gorm:"column:nickname" json:"nickname"`
	
	Status        string `gorm:"column:status;default:'active'" json:"status"`
	Email         string `gorm:"column:email" json:"email"`
	Phone         string `gorm:"column:phone" json:"phone"`
	DateOfBirth   string `gorm:"column:date_of_birth" json:"date_of_birth"`
	Gender        string `gorm:"column:gender" json:"gender"`
	Nationality   string `gorm:"column:nationality" json:"nationality"`
	
	EnrollmentYear    int    `gorm:"column:enrollment_year" json:"enrollment_year"`
	FoodLimitations   string `gorm:"column:food_limitations" json:"food_limitations"`
	HealthLimitations string `gorm:"column:health_limitations" json:"health_limitations"`
	BloodGroup        string `gorm:"column:blood_group" json:"blood_group"`
	ReceivedSpecialHelp string `gorm:"column:received_special_help" json:"received_special_help"`
	ChildLiveWith     string `gorm:"column:child_live_with" json:"child_live_with"`
	DepositInvoicePath string `gorm:"column:deposit_invoice_path" json:"deposit_invoice_path"`
	
	ProfileImage string         `gorm:"column:profile_image;default:'default.png'" json:"profile_image"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships (GORM)
	Parent *Parent `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Year   *Year   `gorm:"foreignKey:YearID" json:"year,omitempty"`
}

// TableName overrides the table name used by Student to `students`
func (Student) TableName() string {
	return "students"
}
