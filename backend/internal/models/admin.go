package models

import (
	"time"

	"gorm.io/gorm"
)

// Admin represents the admins table in the database
type Admin struct {
	ID           int       `gorm:"primaryKey;column:id" json:"id"`
	Username     string    `gorm:"column:username" json:"username"`
	Password     string    `gorm:"column:password" json:"-"`      // hidden in JSON response
	PasswordHash string    `gorm:"column:password_hash" json:"-"` // hidden in JSON response
	Name         string    `gorm:"column:name" json:"name"`
	Fullname     string    `gorm:"column:fullname" json:"fullname"`
	Email        string    `gorm:"column:email" json:"email"`
	PassportName string    `gorm:"column:passport_name" json:"passport_name"`
	Role         string    `gorm:"column:role" json:"role"`
	Photo              string          `gorm:"column:photo" json:"photo"`
	ForcePasswordReset bool            `gorm:"column:force_password_reset;default:false" json:"force_password_reset"`
	CreatedAt          time.Time       `gorm:"column:created_at" json:"created_at"`
	UpdatedAt          time.Time       `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt          gorm.DeletedAt  `gorm:"index" json:"-"`
	TeacherProfile     *TeacherProfile `gorm:"foreignKey:AdminID" json:"teacher_profile,omitempty"`
}

// TableName overrides the table name used by Admin to `admins`
func (Admin) TableName() string {
	return "admins"
}
