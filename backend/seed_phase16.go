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

	fmt.Println("Seeding data for Phase 16 (Shop)...")

	// Categories
	cats := []models.ShopCategory{
		{CategoryName: "Uniforms"},
		{CategoryName: "Books"},
		{CategoryName: "Stationeries"},
	}

	for _, c := range cats {
		db.Where("category_name = ?", c.CategoryName).FirstOrCreate(&c, c)
	}

	var catUniform, catBooks, catStat models.ShopCategory
	db.Where("category_name = ?", "Uniforms").First(&catUniform)
	db.Where("category_name = ?", "Books").First(&catBooks)
	db.Where("category_name = ?", "Stationeries").First(&catStat)

	// Items
	items := []models.ShopItem{
		{CategoryID: catUniform.ID, Name: "Boys Summer Shirt (Size M)", Price: 450, StockQty: 50},
		{CategoryID: catUniform.ID, Name: "Girls Skirt (Size M)", Price: 550, StockQty: 40},
		{CategoryID: catUniform.ID, Name: "PE T-Shirt", Price: 300, StockQty: 100},
		{CategoryID: catBooks.ID, Name: "Mathematics Grade 5 Textbook", Price: 850, StockQty: 30},
		{CategoryID: catBooks.ID, Name: "Science Workbook", Price: 400, StockQty: 0}, // Out of stock
		{CategoryID: catStat.ID, Name: "School Notebook (Lined)", Price: 35, StockQty: 200},
		{CategoryID: catStat.ID, Name: "Color Pencils (24 colors)", Price: 120, StockQty: 15},
	}

	for _, i := range items {
		db.Where("name = ?", i.Name).FirstOrCreate(&i, i)
	}

	fmt.Println("Phase 16 Mock Data Seeded Successfully! 🛍️")
}
