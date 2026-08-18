package models

import (
	"time"

	"gorm.io/gorm"
)

type SupportTicket struct {
	ID            int            `gorm:"primaryKey;column:id" json:"id"`
	TicketNo      string         `gorm:"column:ticket_no;unique;not null" json:"ticket_no"`
	Title         string         `gorm:"column:title;not null" json:"title"`
	Category      string         `gorm:"column:category" json:"category"` // e.g., 'IT', 'Facility', 'General'
	Description   string         `gorm:"column:description" json:"description"`
	Priority      string         `gorm:"column:priority;default:'Medium'" json:"priority"` // 'Low', 'Medium', 'High'
	Status        string         `gorm:"column:status;default:'Open'" json:"status"`       // 'Open', 'In Progress', 'Resolved', 'Closed'
	CreatedByID   int            `gorm:"column:created_by_id;not null" json:"created_by_id"`
	CreatedByType string         `gorm:"column:created_by_type;not null" json:"created_by_type"` // 'Student', 'Admin'
	ImageURL      string         `gorm:"column:image_url" json:"image_url"`                      // Optional attachment
	CreatedAt     time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (SupportTicket) TableName() string {
	return "support_tickets"
}
