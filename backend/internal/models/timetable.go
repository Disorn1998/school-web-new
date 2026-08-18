package models

import (
	"time"

	"gorm.io/gorm"
)

// Timetable represents the class schedule
type Timetable struct {
	ID         int       `gorm:"primaryKey;column:id" json:"id"`
	YearID     int       `gorm:"column:year_id" json:"year_id"`
	SemesterID int       `gorm:"column:semester_id" json:"semester_id"`
	DayOfWeek  int       `gorm:"column:day_of_week" json:"day_of_week"` // 1=Monday, 2=Tuesday, etc.
	Period     int       `gorm:"column:period" json:"period"`           // 1 to 8+
	Subject    string    `gorm:"column:subject" json:"subject"`         // Subject name
	TeacherID  int       `gorm:"column:teacher_id" json:"teacher_id"`   // Refers to admin ID (teacher)
	Room       string    `gorm:"column:room" json:"room"`
	Teacher    *Admin    `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
}

func (Timetable) TableName() string {
	return "timetables"
}

// ECA represents Extracurricular Activities
type ECA struct {
	ID          int            `gorm:"primaryKey;column:id" json:"id"`
	SemesterID  int            `gorm:"column:semester_id" json:"semester_id"`
	Name        string         `gorm:"column:name" json:"name"`
	Description string         `gorm:"column:description" json:"description"`
	DayOfWeek   int            `gorm:"column:day_of_week" json:"day_of_week"` // e.g. 3 = Wednesday
	StartTime   string         `gorm:"column:start_time" json:"start_time"`   // e.g. "15:30"
	EndTime     string         `gorm:"column:end_time" json:"end_time"`       // e.g. "16:30"
	MaxCapacity int            `gorm:"column:max_capacity" json:"max_capacity"`
	Fee         float64        `gorm:"column:fee" json:"fee"`
	TeacherID   int            `gorm:"column:teacher_id" json:"teacher_id"`
	Teacher     *Admin         `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
	IsActive    bool           `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ECA) TableName() string {
	return "ecas"
}

// ECAEnrollment represents students enrolled in ECAs
type ECAEnrollment struct {
	ID        int       `gorm:"primaryKey;column:id" json:"id"`
	ECAID     int       `gorm:"column:eca_id;uniqueIndex:idx_eca_student" json:"eca_id"`
	StudentID int       `gorm:"column:student_id;uniqueIndex:idx_eca_student" json:"student_id"`
	ECA       *ECA      `gorm:"foreignKey:ECAID" json:"eca,omitempty"`
	Student   *Student  `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Status    string    `gorm:"column:status;default:'Enrolled'" json:"status"` // 'Enrolled', 'Cancelled'
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (ECAEnrollment) TableName() string {
	return "eca_enrollments"
}
