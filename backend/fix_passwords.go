package main
import (
	"fmt"
	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)
func main() {
	db, _ := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	
	bytes, _ := bcrypt.GenerateFromPassword([]byte("password"), 10)
	correctHash := string(bytes)
	
	db.Exec("UPDATE admins SET password_hash = ?", correctHash)
	db.Exec("UPDATE parents SET password_hash = ?", correctHash)
	
	fmt.Println("Successfully reset all passwords to 'password'")
}
