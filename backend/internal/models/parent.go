package models

import "time"

// Parent represents the parents table (family unit) in the database
type Parent struct {
	ID        int       `gorm:"primaryKey;column:id" json:"id"`
	Username  string    `gorm:"column:username;unique" json:"username"`
	Password  string    `gorm:"column:password_hash" json:"password,omitempty"`
	
	// Father Details
	FatherFirstname string `gorm:"column:father_firstname" json:"father_firstname"`
	FatherLastname  string `gorm:"column:father_lastname" json:"father_lastname"`
	FatherEmail     string `gorm:"column:father_email" json:"father_email"`
	FatherPhone     string `gorm:"column:father_phone" json:"father_phone"`
	FatherImage     string `gorm:"column:father_image;default:'default.png'" json:"father_image"`

	// Mother Details
	MotherFirstname string `gorm:"column:mother_firstname" json:"mother_firstname"`
	MotherLastname  string `gorm:"column:mother_lastname" json:"mother_lastname"`
	MotherEmail     string `gorm:"column:mother_email" json:"mother_email"`
	MotherPhone     string `gorm:"column:mother_phone" json:"mother_phone"`
	MotherImage     string `gorm:"column:mother_image;default:'default.png'" json:"mother_image"`

	// Guardian 1
	Guardian1Firstname string `gorm:"column:guardian1_firstname" json:"guardian1_firstname"`
	Guardian1Lastname  string `gorm:"column:guardian1_lastname" json:"guardian1_lastname"`
	Guardian1Email     string `gorm:"column:guardian1_email" json:"guardian1_email"`
	Guardian1Phone     string `gorm:"column:guardian1_phone" json:"guardian1_phone"`

	// Guardian 2
	Guardian2Firstname string `gorm:"column:guardian2_firstname" json:"guardian2_firstname"`
	Guardian2Lastname  string `gorm:"column:guardian2_lastname" json:"guardian2_lastname"`
	Guardian2Email     string `gorm:"column:guardian2_email" json:"guardian2_email"`
	Guardian2Phone     string `gorm:"column:guardian2_phone" json:"guardian2_phone"`

	// Billing and Address
	InvoiceTarget string `gorm:"column:invoice_target" json:"invoice_target"` // e.g. Father, Mother, Guardian
	AddressLine1  string `gorm:"column:address_line1" json:"address_line1"`
	AddressLine2  string `gorm:"column:address_line2" json:"address_line2"`
	City          string `gorm:"column:city" json:"city"`
	Province      string `gorm:"column:province" json:"province"`
	Postcode      string `gorm:"column:postcode" json:"postcode"`
	Country       string `gorm:"column:country" json:"country"`

	Status     string    `gorm:"column:status;default:'active'" json:"status"`
	LoginCount int       `gorm:"column:login_count" json:"login_count"`
	LastLogin  time.Time `gorm:"column:last_login" json:"last_login"`
	LastDevice string    `gorm:"column:last_device" json:"last_device"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relationships
	Students []Student `gorm:"foreignKey:ParentID" json:"students,omitempty"`
}

// TableName overrides the table name used by Parent to `parents`
func (Parent) TableName() string {
	return "parents"
}
