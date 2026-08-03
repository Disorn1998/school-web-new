package models

import "time"

// Attendance represents the attendance table in the database
type Attendance struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	UserID      int       `gorm:"column:user_id" json:"user_id"` // References admins or students
	WorkDate    string    `gorm:"column:work_date" json:"work_date"`
	CheckIn     string    `gorm:"column:check_in" json:"check_in"`
	Status      string    `gorm:"column:status" json:"status"` // 'ontime', 'late'
	LateMinutes int       `gorm:"column:late_minutes" json:"late_minutes"`
	IPAddress   string    `gorm:"column:ip_address" json:"ip_address"`
	Latitude    float64   `gorm:"column:latitude" json:"latitude"`
	Longitude   float64   `gorm:"column:longitude" json:"longitude"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
}

// TableName overrides the table name used by Attendance to `attendance`
func (Attendance) TableName() string {
	return "attendance"
}
