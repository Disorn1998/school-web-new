package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// --- Categories ---

func GetLibraryCategories(c *fiber.Ctx) error {
	var categories []models.LibraryCategory
	if err := database.DB.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch categories"})
	}
	return c.JSON(categories)
}

func CreateLibraryCategory(c *fiber.Ctx) error {
	var category models.LibraryCategory
	if err := c.BodyParser(&category); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if err := database.DB.Create(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create category"})
	}
	return c.Status(fiber.StatusCreated).JSON(category)
}

// --- Books ---

func GetLibraryBooks(c *fiber.Ctx) error {
	var books []models.LibraryBook
	query := database.DB.Preload("Category")
	
	search := c.Query("search")
	if search != "" {
		query = query.Where("title LIKE ? OR author LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&books).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch books"})
	}
	return c.JSON(books)
}

func CreateLibraryBook(c *fiber.Ctx) error {
	var book models.LibraryBook
	if err := c.BodyParser(&book); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	book.AvailableCopies = book.TotalCopies // Initially, available = total
	if err := database.DB.Create(&book).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add book"})
	}
	return c.Status(fiber.StatusCreated).JSON(book)
}

// --- Borrowing ---

func GetBorrowings(c *fiber.Ctx) error {
	status := c.Query("status")
	var borrowings []models.BookBorrowing
	
	query := database.DB.Preload("Book").Preload("Student").Preload("Teacher")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at desc").Find(&borrowings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch borrowings"})
	}
	return c.JSON(borrowings)
}

func GetStudentBorrowings(c *fiber.Ctx) error {
	studentID := c.Params("id")
	var borrowings []models.BookBorrowing
	
	if err := database.DB.Preload("Book").Where("student_id = ?", studentID).Order("created_at desc").Find(&borrowings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch student borrowings"})
	}
	return c.JSON(borrowings)
}

func BorrowBook(c *fiber.Ctx) error {
	var req struct {
		BookID    int `json:"book_id"`
		StudentID *int `json:"student_id"`
		TeacherID *int `json:"teacher_id"`
		Days      int `json:"days"` // How many days to borrow
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if req.Days <= 0 {
		req.Days = 7 // Default to 7 days
	}

	// Validate if user exists logic based on token, etc.
	if req.StudentID == nil && req.TeacherID == nil {
		// If both nil, assume student from token
		user := c.Locals("user").(jwt.MapClaims)
		if user["role"] == "student" {
			id := int(user["id"].(float64))
			req.StudentID = &id
		} else if user["role"] == "teacher" {
			id := int(user["id"].(float64))
			req.TeacherID = &id
		} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Must provide borrower ID"})
		}
	}

	// Start Transaction
	tx := database.DB.Begin()

	var book models.LibraryBook
	if err := tx.First(&book, req.BookID).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Book not found"})
	}

	if book.AvailableCopies <= 0 {
		tx.Rollback()
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Book is currently out of stock"})
	}

	// Create borrowing record
	now := time.Now()
	dueDate := now.AddDate(0, 0, req.Days)

	borrowing := models.BookBorrowing{
		BookID:     req.BookID,
		StudentID:  req.StudentID,
		TeacherID:  req.TeacherID,
		BorrowDate: now.Format("2006-01-02"),
		DueDate:    dueDate.Format("2006-01-02"),
		Status:     "BORROWED",
	}

	if err := tx.Create(&borrowing).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record borrowing"})
	}

	// Decrement available copies
	book.AvailableCopies -= 1
	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update book stock"})
	}

	tx.Commit()
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Book borrowed successfully", "borrowing": borrowing})
}

func ReturnBook(c *fiber.Ctx) error {
	id := c.Params("id")
	
	tx := database.DB.Begin()

	var borrowing models.BookBorrowing
	if err := tx.First(&borrowing, id).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Borrowing record not found"})
	}

	if borrowing.Status == "RETURNED" {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Book already returned"})
	}

	now := time.Now()
	todayStr := now.Format("2006-01-02")
	borrowing.ReturnDate = &todayStr
	borrowing.Status = "RETURNED"

	// Calculate fine if overdue (e.g. 5 baht per day)
	dueDate, _ := time.Parse("2006-01-02", borrowing.DueDate)
	if now.After(dueDate) {
		daysLate := int(now.Sub(dueDate).Hours() / 24)
		if daysLate > 0 {
			borrowing.FineAmount = float64(daysLate * 5)
		}
	}

	if err := tx.Save(&borrowing).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update borrowing record"})
	}

	// Increment available copies
	var book models.LibraryBook
	if err := tx.First(&book, borrowing.BookID).Error; err == nil {
		book.AvailableCopies += 1
		tx.Save(&book)
	}

	tx.Commit()
	return c.JSON(fiber.Map{"message": "Book returned successfully", "borrowing": borrowing})
}
