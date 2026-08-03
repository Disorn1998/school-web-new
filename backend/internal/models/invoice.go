package models

import "time"

// Semester represents the semesters table
type Semester struct {
	ID           int    `gorm:"primaryKey;column:id" json:"id"`
	SemesterName string `gorm:"column:semester_name" json:"semester_name"`
	AcademicYear string `gorm:"column:academic_year" json:"academic_year"`
	Status       string `gorm:"column:status" json:"status"` // e.g., 'ACTIVE'
}

// TableName overrides the table name used by Semester to `semesters`
func (Semester) TableName() string {
	return "semesters"
}

// Invoice represents the invoices or invoice_headers table
type Invoice struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"`
	InvoiceNo   string    `gorm:"column:invoice_no;unique" json:"invoice_no"` // Used for Ref1
	StudentID   int       `gorm:"column:student_id" json:"student_id"`
	SemesterID  int       `gorm:"column:semester_id" json:"semester_id"`
	IssueDate   string    `gorm:"column:issue_date" json:"issue_date"`
	DueDate     string    `gorm:"column:due_date" json:"due_date"`
	LateFee     float64   `gorm:"column:late_fee" json:"late_fee"`
	TotalAmount float64   `gorm:"column:total_amount" json:"total_amount"`
	Status      string    `gorm:"column:status;default:'Pending'" json:"status"` // 'Pending', 'Paid'
	PaidAt      time.Time `gorm:"column:paid_at" json:"paid_at"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`

	// Relationships
	Student  Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Semester Semester      `gorm:"foreignKey:SemesterID" json:"semester,omitempty"`
	Items    []InvoiceItem `gorm:"foreignKey:InvoiceID" json:"items,omitempty"`
}

// TableName overrides the table name used by Invoice to `invoices`
func (Invoice) TableName() string {
	return "invoices"
}

// InvoiceItem represents the invoice_items table
type InvoiceItem struct {
	ID          int     `gorm:"primaryKey;column:id" json:"id"`
	InvoiceID   int     `gorm:"column:invoice_id" json:"invoice_id"`
	Description string  `gorm:"column:description" json:"description"`
	Amount      float64 `gorm:"column:amount" json:"amount"`
}

// TableName overrides the table name used by InvoiceItem to `invoice_items`
func (InvoiceItem) TableName() string {
	return "invoice_items"
}
