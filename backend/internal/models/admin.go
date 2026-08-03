package models

import "time"

// Admin represents the admins table in the database
type Admin struct {
	ID           int       `gorm:"primaryKey;column:id" json:"id"`
	Username     string    `gorm:"column:username" json:"username"`
	Password     string    `gorm:"column:password" json:"-"`      // hidden in JSON response
	PasswordHash string    `gorm:"column:password_hash" json:"-"` // hidden in JSON response
	Name         string    `gorm:"column:name" json:"name"`
	Fullname     string    `gorm:"column:fullname" json:"fullname"`
	Role         string    `gorm:"column:role" json:"role"`
	Photo        string    `gorm:"column:photo" json:"photo"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`
}

// TableName overrides the table name used by Admin to `admins`
func (Admin) TableName() string {
	return "admins"
}
