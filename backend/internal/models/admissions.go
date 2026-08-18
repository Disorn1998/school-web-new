package models

import (
	"time"

	"gorm.io/gorm"
)

type AdmissionApplication struct {
	ID               int            `gorm:"primaryKey;column:id" json:"id"`
	ApplicationNo    string         `gorm:"column:application_no;unique;not null" json:"application_no"`
	StudentFirstName string         `gorm:"column:student_first_name;not null" json:"student_first_name"`
	StudentLastName  string         `gorm:"column:student_last_name;not null" json:"student_last_name"`
	DateOfBirth      string         `gorm:"column:date_of_birth" json:"date_of_birth"`
	GradeApplying    string         `gorm:"column:grade_applying" json:"grade_applying"`
	ParentName       string         `gorm:"column:parent_name;not null" json:"parent_name"`
	ParentEmail      string         `gorm:"column:parent_email;not null" json:"parent_email"`
	ParentPhone      string         `gorm:"column:parent_phone" json:"parent_phone"`
	Status           string         `gorm:"column:status;default:'Pending'" json:"status"` // 'Pending', 'Interview', 'Accepted', 'Rejected', 'Registered'
	Notes            string         `gorm:"column:notes" json:"notes"`
	CreatedAt        time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

func (AdmissionApplication) TableName() string {
	return "admission_applications"
}
