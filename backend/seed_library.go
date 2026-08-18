package main

import (
	"backend/internal/models"
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Seeding data for Phase 10 (Library)...")

	// 1. Categories
	categories := []models.LibraryCategory{
		{Name: "Science Fiction", Description: "Sci-Fi novels and stories"},
		{Name: "Educational", Description: "Textbooks and academic materials"},
		{Name: "Fantasy", Description: "Fantasy and magic novels"},
	}
	for _, c := range categories {
		db.FirstOrCreate(&c, models.LibraryCategory{Name: c.Name})
	}

	// Fetch categories to get IDs
	var catSciFi, catEdu models.LibraryCategory
	db.Where("name = ?", "Science Fiction").First(&catSciFi)
	db.Where("name = ?", "Educational").First(&catEdu)

	// 2. Books
	books := []models.LibraryBook{
		{Title: "Dune", Author: "Frank Herbert", ISBN: "978-0441172719", Publisher: "Chilton Books", YearPublished: 1965, TotalCopies: 5, AvailableCopies: 4, Location: "Shelf A1", CategoryID: catSciFi.ID, CoverImage: "https://upload.wikimedia.org/wikipedia/en/d/de/Dune-Frank_Herbert_%281965%29_First_edition.jpg"},
		{Title: "Advanced Physics", Author: "Steve Adams", ISBN: "978-0199146802", Publisher: "Oxford", YearPublished: 2000, TotalCopies: 10, AvailableCopies: 10, Location: "Shelf B2", CategoryID: catEdu.ID},
		{Title: "Introduction to Algorithms", Author: "Thomas H. Cormen", ISBN: "978-0262033848", Publisher: "MIT Press", YearPublished: 2009, TotalCopies: 3, AvailableCopies: 2, Location: "Shelf C1", CategoryID: catEdu.ID, CoverImage: "https://upload.wikimedia.org/wikipedia/en/1/19/Introduction_to_Algorithms_%28cover%29.jpg"},
	}
	for _, b := range books {
		db.FirstOrCreate(&b, models.LibraryBook{Title: b.Title})
	}

	var bookDune, bookAlgo models.LibraryBook
	db.Where("title = ?", "Dune").First(&bookDune)
	db.Where("title = ?", "Introduction to Algorithms").First(&bookAlgo)

	// 3. Borrowing Records
	studentID := 1
	borrowings := []models.BookBorrowing{
		{BookID: bookDune.ID, StudentID: &studentID, BorrowDate: "2026-08-01", DueDate: "2026-08-08", Status: "OVERDUE", FineAmount: 50},
		{BookID: bookAlgo.ID, StudentID: &studentID, BorrowDate: "2026-08-15", DueDate: "2026-08-22", Status: "BORROWED"},
	}
	for _, br := range borrowings {
		db.FirstOrCreate(&br, models.BookBorrowing{BookID: br.BookID, StudentID: br.StudentID})
	}

	fmt.Println("Library Mock Data Seeded Successfully! 📚")
}
