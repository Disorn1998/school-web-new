package models

import "time"

// AuditLog tracks actions performed by users (Admin, Officer, etc.)
type AuditLog struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	UserID      int       `gorm:"column:user_id;index" json:"user_id"`
	UserType    string    `gorm:"column:user_type" json:"user_type"` // e.g. 'staff', 'student', 'parent'
	Action      string    `gorm:"column:action;index" json:"action"`
	Description string    `gorm:"column:description" json:"description"`
	IPAddress   string    `gorm:"column:ip_address" json:"ip_address"`
	CreatedAt   time.Time `gorm:"column:created_at;index" json:"created_at"`
}

// TableName overrides the table name used by AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// LoginAttempt tracks failed logins to prevent Brute Force attacks
type LoginAttempt struct {
	ID            int       `gorm:"primaryKey;column:id" json:"id"`
	Username      string    `gorm:"column:username;index" json:"username"`
	IPAddress     string    `gorm:"column:ip_address;index" json:"ip_address"`
	Attempts      int       `gorm:"column:attempts;default:0" json:"attempts"`
	LastAttemptAt time.Time `gorm:"column:last_attempt_at" json:"last_attempt_at"`
	LockedUntil   time.Time `gorm:"column:locked_until" json:"locked_until"`
}

// TableName overrides the table name used by LoginAttempt
func (LoginAttempt) TableName() string {
	return "login_attempts"
}

// LoginHistory tracks successful logins and device information
type LoginHistory struct {
	ID        int       `gorm:"primaryKey;column:id" json:"id"`
	UserID    int       `gorm:"column:user_id;index" json:"user_id"`
	UserType  string    `gorm:"column:user_type" json:"user_type"` // 'staff', 'student'
	IPAddress string    `gorm:"column:ip_address" json:"ip_address"`
	UserAgent string    `gorm:"column:user_agent" json:"user_agent"`
	Device    string    `gorm:"column:device" json:"device"`
	LoginAt   time.Time `gorm:"column:login_at;index" json:"login_at"`
}

// TableName overrides the table name used by LoginHistory
func (LoginHistory) TableName() string {
	return "login_history"
}
