package models

import (
	"time"

	"gorm.io/gorm"
)

// HealthRecord represents long-term health info for a student
type HealthRecord struct {
	ID                 int            `gorm:"primaryKey;column:id" json:"id"`
	StudentID          int            `gorm:"column:student_id;unique;not null" json:"student_id"`
	BloodType          string         `gorm:"column:blood_type" json:"blood_type"` // A, B, O, AB
	WeightKg           float64        `gorm:"column:weight_kg" json:"weight_kg"`
	HeightCm           float64        `gorm:"column:height_cm" json:"height_cm"`
	Allergies          string         `gorm:"column:allergies" json:"allergies"`
	UnderlyingDiseases string         `gorm:"column:underlying_diseases" json:"underlying_diseases"`
	EmergencyContact   string         `gorm:"column:emergency_contact" json:"emergency_contact"`
	Student            *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	CreatedAt          time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

func (HealthRecord) TableName() string {
	return "health_records"
}

// HealthIncident represents a specific event (sickness or accident) at school
type HealthIncident struct {
	ID          int            `gorm:"primaryKey;column:id" json:"id"`
	StudentID   int            `gorm:"column:student_id;not null" json:"student_id"`
	ReporterID  int            `gorm:"column:reporter_id;not null" json:"reporter_id"` // Teacher/Nurse who logged it
	IncidentDate string        `gorm:"column:incident_date;type:date" json:"incident_date"`
	IncidentType string        `gorm:"column:incident_type" json:"incident_type"` // 'Sickness', 'Accident'
	Severity    string         `gorm:"column:severity" json:"severity"` // 'Low', 'Medium', 'High'
	Description string         `gorm:"column:description" json:"description"`
	ActionTaken string         `gorm:"column:action_taken" json:"action_taken"`
	Student     *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Reporter    *Admin         `gorm:"foreignKey:ReporterID" json:"reporter,omitempty"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (HealthIncident) TableName() string {
	return "health_incidents"
}
