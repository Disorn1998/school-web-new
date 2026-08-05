package models

import (
	"time"

	"gorm.io/gorm"
)

// DutyDay represents the day of the week
type DutyDay struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	Name      string         `gorm:"column:name" json:"name"`             // e.g. "Monday"
	SortOrder int            `gorm:"column:sort_order" json:"sort_order"` // 1 for Monday, 2 for Tuesday, etc.
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (DutyDay) TableName() string {
	return "duty_days"
}

// DutyTimeSlot represents the time slot (e.g., Morning, Lunch, After School)
type DutyTimeSlot struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	Name      string         `gorm:"column:name" json:"name"`             // e.g. "Morning", "Lunch"
	SortOrder int            `gorm:"column:sort_order" json:"sort_order"` // Order of appearance
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (DutyTimeSlot) TableName() string {
	return "duty_time_slots"
}

// DutyArea represents the area where the duty takes place (e.g., Gate 1, Playground)
type DutyArea struct {
	ID        int            `gorm:"primaryKey;column:id" json:"id"`
	Name      string         `gorm:"column:name" json:"name"` // e.g. "Gate 1", "Playground"
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (DutyArea) TableName() string {
	return "duty_areas"
}

// DutyAssignment represents the assignment of a teacher to a specific day, time, and area
type DutyAssignment struct {
	ID         int            `gorm:"primaryKey;column:id" json:"id"`
	TeacherID  int            `gorm:"column:teacher_id;index" json:"teacher_id"`
	Teacher    *Admin         `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"` // Re-using Admin for Teacher
	DayID      int            `gorm:"column:day_id" json:"day_id"`
	Day        *DutyDay       `gorm:"foreignKey:DayID" json:"day,omitempty"`
	TimeSlotID int            `gorm:"column:time_slot_id" json:"time_slot_id"`
	TimeSlot   *DutyTimeSlot  `gorm:"foreignKey:TimeSlotID" json:"time_slot,omitempty"`
	AreaID     int            `gorm:"column:area_id" json:"area_id"`
	Area       *DutyArea      `gorm:"foreignKey:AreaID" json:"area,omitempty"`
	CreatedAt  time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (DutyAssignment) TableName() string {
	return "duty_assignments"
}
