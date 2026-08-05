package models

import (
	"time"

	"gorm.io/gorm"
)

// InvoiceHeader represents a batch of invoices generated (e.g., "Term 1 Fees for Year 1")
type InvoiceHeader struct {
	ID               int            `gorm:"primaryKey;column:id" json:"id"`
	InvoiceNo        string         `gorm:"column:invoice_no;unique" json:"invoice_no"` // e.g., "INV-2026-0001"
	InvoiceType      string         `gorm:"column:invoice_type;default:'GENERAL'" json:"invoice_type"` // 'GENERAL', 'TUITION', 'ECAs'
	IssueDate        string         `gorm:"column:issue_date;type:date" json:"issue_date"`
	DueDate          string         `gorm:"column:due_date;type:date" json:"due_date"`
	SemesterID       int            `gorm:"column:semester_id" json:"semester_id"`
	YearID           int            `gorm:"column:year_id" json:"year_id"`
	CommencementDate string         `gorm:"column:commencement_date;type:date" json:"commencement_date"`
	EndDate          string         `gorm:"column:end_date;type:date" json:"end_date"`
	LateFee          float64        `gorm:"column:late_fee;default:0" json:"late_fee"`
	CreatedBy        int            `gorm:"column:created_by" json:"created_by"` // Admin who generated it
	CreatedAt        time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	Semester Semester `gorm:"foreignKey:SemesterID" json:"semester,omitempty"`
	Year     Year     `gorm:"foreignKey:YearID" json:"year,omitempty"`
}

func (InvoiceHeader) TableName() string {
	return "invoice_headers"
}

// Invoice represents a specific student's invoice
type Invoice struct {
	ID              int            `gorm:"primaryKey;column:id" json:"id"`
	InvoiceHeaderID int            `gorm:"column:invoice_header_id" json:"invoice_header_id"`
	StudentID       int            `gorm:"column:student_id" json:"student_id"`
	Subtotal        float64        `gorm:"column:subtotal" json:"subtotal"`
	Total           float64        `gorm:"column:total" json:"total"`
	Status          string         `gorm:"column:status;default:'UNPAID'" json:"status"` // 'UNPAID', 'PENDING', 'PAID'
	PaymentMethod   string         `gorm:"column:payment_method" json:"payment_method"`
	PaidAt          *time.Time     `gorm:"column:paid_at" json:"paid_at"`
	CreatedAt       time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Header InvoiceHeader `gorm:"foreignKey:InvoiceHeaderID" json:"header,omitempty"`
	Student Student      `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Items   []InvoiceItem `gorm:"foreignKey:InvoiceID" json:"items,omitempty"`
	Payment *Payment      `gorm:"foreignKey:InvoiceID" json:"payment,omitempty"`
}

func (Invoice) TableName() string {
	return "invoices"
}

// InvoiceItem represents individual line items (e.g., Tuition Fee, Visa Fee)
type InvoiceItem struct {
	ID        int       `gorm:"primaryKey;column:id" json:"id"`
	InvoiceID int       `gorm:"column:invoice_id" json:"invoice_id"`
	ItemName  string    `gorm:"column:item_name" json:"item_name"`
	Amount    float64   `gorm:"column:amount" json:"amount"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (InvoiceItem) TableName() string {
	return "invoice_items"
}

// Payment represents the payment slip uploaded by a parent
type Payment struct {
	ID         int        `gorm:"primaryKey;column:id" json:"id"`
	InvoiceID  int        `gorm:"column:invoice_id;unique" json:"invoice_id"`
	SlipImage  string     `gorm:"column:slip_image" json:"slip_image"` // Path to uploaded slip
	Amount     float64    `gorm:"column:amount" json:"amount"`
	Status     string     `gorm:"column:status;default:'PENDING'" json:"status"` // 'PENDING', 'APPROVED', 'REJECTED'
	PaidAt     time.Time  `gorm:"column:paid_at;autoCreateTime" json:"paid_at"` // When slip was uploaded
	VerifiedAt *time.Time `gorm:"column:verified_at" json:"verified_at"` // When admin approved
	CreatedAt  time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"column:updated_at" json:"updated_at"`
}

func (Payment) TableName() string {
	return "payments"
}

// StudentDiscount represents a pending discount to be applied to a student's next invoice
type StudentDiscount struct {
	ID            int       `gorm:"primaryKey;column:id" json:"id"`
	StudentID     int       `gorm:"column:student_id" json:"student_id"`
	DiscountAmount float64  `gorm:"column:discount_amount" json:"discount_amount"`
	Remark         string  `gorm:"column:remark" json:"remark"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updated_at"`

	Student Student `gorm:"foreignKey:StudentID" json:"student,omitempty"`
}

func (StudentDiscount) TableName() string {
	return "student_discounts"
}

// ReminderMessage represents a notification template
type ReminderMessage struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	MessageText string    `gorm:"column:message_text;type:text" json:"message_text"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (ReminderMessage) TableName() string {
	return "reminder_messages"
}

// ReminderSchedule represents a cron-like rule for sending reminders
type ReminderSchedule struct {
	ID            int       `gorm:"primaryKey;column:id" json:"id"`
	MessageIDs    string    `gorm:"column:message_ids;type:json" json:"message_ids"` // JSON array of ReminderMessage IDs
	ScheduleType  string    `gorm:"column:schedule_type" json:"schedule_type"` // e.g. 'once', 'recurring'
	FrequencyDays int       `gorm:"column:frequency_days" json:"frequency_days"` // e.g. 7
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (ReminderSchedule) TableName() string {
	return "reminder_schedules"
}
