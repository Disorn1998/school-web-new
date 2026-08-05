package models

import (
	"time"

	"gorm.io/gorm"
)

// Year represents the years (classes/levels) table in the database
type Year struct {
	ID       int    `gorm:"primaryKey;column:id" json:"id"`
	YearName string `gorm:"column:year_name" json:"year_name"` // e.g., "Year 1"
	Level    string `gorm:"column:level" json:"level"`         // e.g., "Primary", "Secondary"
}

func (Year) TableName() string {
	return "years"
}

// Semester represents academic terms
type Semester struct {
	ID                 int            `gorm:"primaryKey;column:id" json:"id"`
	SemesterName       string         `gorm:"column:semester_name" json:"semester_name"` // e.g., "Semester 1 (2026 - 2027)"
	AcademicYear       string         `gorm:"column:academic_year" json:"academic_year"` // e.g., "2026"
	StartDate          string         `gorm:"column:start_date;type:date" json:"start_date"`
	EndDate            string         `gorm:"column:end_date;type:date" json:"end_date"`
	Status             string         `gorm:"column:status;default:'INACTIVE'" json:"status"` // 'ACTIVE', 'INACTIVE'
	NumberOfSchoolDays int            `gorm:"column:number_of_school_days" json:"number_of_school_days"`
	CreatedAt          time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Semester) TableName() string {
	return "semesters"
}

// TuitionFee represents the base tuition fee for a specific year level
type TuitionFee struct {
	ID         int            `gorm:"primaryKey;column:id" json:"id"`
	YearID     int            `gorm:"column:year_id;unique" json:"year_id"`
	Year       *Year          `gorm:"foreignKey:YearID" json:"year,omitempty"`
	TuitionFee float64        `gorm:"column:tuition_fee" json:"tuition_fee"`
	CreatedAt  time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (TuitionFee) TableName() string {
	return "tuition_fees"
}

// Subject represents the subjects table
type Subject struct {
	ID          int    `gorm:"primaryKey;column:id" json:"id"`
	SubjectName string `gorm:"column:subject_name" json:"subject_name"`
}

func (Subject) TableName() string {
	return "subjects"
}
