package main

import (
	"fmt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, _ := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	db.Exec("UPDATE parents SET password_hash = '$2y$10$8hD6kDe5niwcZZrCZd.OdOm9FO.PVIl6QVoVH6CumxDZmmrLWKAxG'")
	fmt.Println("All parent passwords set to 'password'")
}
