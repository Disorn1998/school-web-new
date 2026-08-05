package main
import (
	"fmt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)
type Student struct {
	ID   uint   `gorm:"primaryKey"`
	Role string `gorm:"column:role"`
}
func main() {
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		fmt.Println("Error connecting:", err)
		return
	}
	var count int64
	db.Model(&Student{}).
	fmt.Println("Students in DB: ", count)
}
