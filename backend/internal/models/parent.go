package models

import "time"

// Parent represents the parents table in the database
type Parent struct {
	ID           int       `gorm:"primaryKey;column:id" json:"id"`
	Username     string    `gorm:"column:username" json:"username"`
	PasswordHash string    `gorm:"column:password_hash" json:"-"` // hidden in JSON response
	LoginCount   int       `gorm:"column:login_count" json:"login_count"`
	LastLogin    time.Time `gorm:"column:last_login" json:"last_login"`
	LastDevice   string    `gorm:"column:last_device" json:"last_device"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`
}

// TableName overrides the table name used by Parent to `parents`
func (Parent) TableName() string {
	return "parents"
}
