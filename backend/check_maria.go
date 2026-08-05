package main
import (
	"fmt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)
type Admin struct {
	Username string
	PasswordHash string `gorm:"column:password_hash"`
	Password string `gorm:"column:password"`
}
func main() {
	db, _ := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	var admin Admin
	db.Where("username = ?", "maria").First(&admin)
	fmt.Printf("maria pass: %s\nhash: %s\n", admin.Password, admin.PasswordHash)
}
