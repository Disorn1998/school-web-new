package models

import (
	"time"

	"gorm.io/gorm"
)

// LibraryCategory represents a book category/genre
type LibraryCategory struct {
	ID          int            `gorm:"primaryKey;column:id" json:"id"`
	Name        string         `gorm:"column:name;not null" json:"name"`
	Description string         `gorm:"column:description" json:"description"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (LibraryCategory) TableName() string {
	return "library_categories"
}

// LibraryBook represents a book in the library catalog
type LibraryBook struct {
	ID              int              `gorm:"primaryKey;column:id" json:"id"`
	CategoryID      int              `gorm:"column:category_id" json:"category_id"`
	Title           string           `gorm:"column:title;not null" json:"title"`
	Author          string           `gorm:"column:author" json:"author"`
	ISBN            string           `gorm:"column:isbn" json:"isbn"`
	Publisher       string           `gorm:"column:publisher" json:"publisher"`
	YearPublished   int              `gorm:"column:year_published" json:"year_published"`
	CoverImage      string           `gorm:"column:cover_image" json:"cover_image"`
	TotalCopies     int              `gorm:"column:total_copies;default:1" json:"total_copies"`
	AvailableCopies int              `gorm:"column:available_copies;default:1" json:"available_copies"`
	Location        string           `gorm:"column:location" json:"location"` // e.g., "Shelf A1"
	Category        *LibraryCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	CreatedAt       time.Time        `gorm:"column:created_at" json:"created_at"`
	DeletedAt       gorm.DeletedAt   `gorm:"index" json:"-"`
}

func (LibraryBook) TableName() string {
	return "library_books"
}

// BookBorrowing represents a record of a book being borrowed
type BookBorrowing struct {
	ID         int            `gorm:"primaryKey;column:id" json:"id"`
	BookID     int            `gorm:"column:book_id;not null" json:"book_id"`
	StudentID  *int           `gorm:"column:student_id" json:"student_id"` // Nullable if teacher borrows
	TeacherID  *int           `gorm:"column:teacher_id" json:"teacher_id"` // Nullable if student borrows
	BorrowDate string         `gorm:"column:borrow_date;type:date" json:"borrow_date"`
	DueDate    string         `gorm:"column:due_date;type:date" json:"due_date"`
	ReturnDate *string        `gorm:"column:return_date;type:date" json:"return_date"`
	Status     string         `gorm:"column:status;default:'BORROWED'" json:"status"` // 'BORROWED', 'RETURNED', 'OVERDUE'
	FineAmount float64        `gorm:"column:fine_amount;default:0" json:"fine_amount"`
	Book       *LibraryBook   `gorm:"foreignKey:BookID" json:"book,omitempty"`
	Student    *Student       `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Teacher    *Admin         `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"` // Assuming teachers are in Admins table
	CreatedAt  time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time      `gorm:"column:updated_at" json:"updated_at"`
}

func (BookBorrowing) TableName() string {
	return "book_borrowings"
}
