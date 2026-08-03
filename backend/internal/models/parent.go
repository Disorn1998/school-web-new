package models

import "time"

// Parent represents the parents table in the database
type Parent struct {
	ID           int    `gorm:"primaryKey;column:id" json:"id"`
	Username     string `gorm:"column:username" json:"username"`
	PasswordHash string `gorm:"column:password_hash" json:"-"` // hidden in JSON response

	FatherFirstname string `gorm:"column:father_firstname" json:"father_firstname"`
	FatherLastname  string `gorm:"column:father_lastname" json:"father_lastname"`
	FatherPhone     string `gorm:"column:father_phone" json:"father_phone"`
	FatherEmail     string `gorm:"column:father_email" json:"father_email"`

	MotherFirstname string `gorm:"column:mother_firstname" json:"mother_firstname"`
	MotherLastname  string `gorm:"column:mother_lastname" json:"mother_lastname"`
	MotherPhone     string `gorm:"column:mother_phone" json:"mother_phone"`
	MotherEmail     string `gorm:"column:mother_email" json:"mother_email"`

	Guardian1Firstname string `gorm:"column:guardian1_firstname" json:"guardian1_firstname"`
	Guardian1Phone     string `gorm:"column:guardian1_phone" json:"guardian1_phone"`
	Guardian2Firstname string `gorm:"column:guardian2_firstname" json:"guardian2_firstname"`
	Guardian2Phone     string `gorm:"column:guardian2_phone" json:"guardian2_phone"`

	Status     string    `gorm:"column:status;default:'active'" json:"status"`
	LoginCount int       `gorm:"column:login_count" json:"login_count"`
	LastLogin  time.Time `gorm:"column:last_login" json:"last_login"`
	LastDevice string    `gorm:"column:last_device" json:"last_device"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relationships
	Students []Student `gorm:"foreignKey:ParentID" json:"students,omitempty"`
}

// TableName overrides the table name used by Parent to `parents`
func (Parent) TableName() string {
	return "parents"
}
