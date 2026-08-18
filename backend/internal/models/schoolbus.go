package models

import (
	"time"

	"gorm.io/gorm"
)

// SchoolBusRoute represents a school bus line/route
type SchoolBusRoute struct {
	ID          int            `gorm:"primaryKey;column:id" json:"id"`
	RouteName   string         `gorm:"column:route_name;not null" json:"route_name"` // e.g. "Line 1: Sukhumvit"
	DriverName  string         `gorm:"column:driver_name" json:"driver_name"`
	ContactInfo string         `gorm:"column:contact_info" json:"contact_info"` // Phone number
	LicensePlate string        `gorm:"column:license_plate" json:"license_plate"`
	MaxCapacity int            `gorm:"column:max_capacity;default:12" json:"max_capacity"`
	MonthlyFee  float64        `gorm:"column:monthly_fee" json:"monthly_fee"` // Monthly cost for round trip
	Description string         `gorm:"column:description" json:"description"` // Areas covered
	IsActive    bool           `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (SchoolBusRoute) TableName() string {
	return "school_bus_routes"
}

// SchoolBusRegistration represents a student's enrollment in a school bus
type SchoolBusRegistration struct {
	ID         int             `gorm:"primaryKey;column:id" json:"id"`
	StudentID  int             `gorm:"column:student_id;not null" json:"student_id"`
	RouteID    int             `gorm:"column:route_id;not null" json:"route_id"`
	SemesterID int             `gorm:"column:semester_id;not null" json:"semester_id"` // Registered for which term
	TripType   string          `gorm:"column:trip_type;default:'Round Trip'" json:"trip_type"` // 'Round Trip', 'Morning Only', 'Afternoon Only'
	Status     string          `gorm:"column:status;default:'Active'" json:"status"`   // 'Active', 'Cancelled'
	Student    *Student        `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Route      *SchoolBusRoute `gorm:"foreignKey:RouteID" json:"route,omitempty"`
	CreatedAt  time.Time       `gorm:"column:created_at" json:"created_at"`
}

func (SchoolBusRegistration) TableName() string {
	return "school_bus_registrations"
}
