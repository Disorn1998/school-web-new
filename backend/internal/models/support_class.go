package models

import (
	"time"

	"gorm.io/gorm"
)

type SupportClass struct {
	ID          int               `gorm:"primaryKey;column:id" json:"id"`
	Title       string            `gorm:"column:title;not null" json:"title"`
	Description string            `gorm:"column:description" json:"description"`
	Schedule    string            `gorm:"column:schedule" json:"schedule"`
	Price       float64           `gorm:"column:price" json:"price"`
	Capacity    int               `gorm:"column:capacity" json:"capacity"`
	Enrollments []ClassEnrollment `gorm:"foreignKey:SupportClassID" json:"enrollments,omitempty"`
	CreatedAt   time.Time         `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time         `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt   gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (SupportClass) TableName() string {
	return "support_classes"
}

type ClassEnrollment struct {
	ID             int            `gorm:"primaryKey;column:id" json:"id"`
	StudentID      int            `gorm:"column:student_id;not null" json:"student_id"`
	SupportClassID int            `gorm:"column:support_class_id;not null" json:"support_class_id"`
	Status         string         `gorm:"column:status;default:'Pending Payment'" json:"status"` // 'Pending Payment', 'Enrolled'
	Student        *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	SupportClass   *SupportClass  `gorm:"foreignKey:SupportClassID" json:"support_class,omitempty"`
	CreatedAt      time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ClassEnrollment) TableName() string {
	return "class_enrollments"
}
