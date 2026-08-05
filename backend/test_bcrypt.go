package main
import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)
func main() {
	hash := "$2y$10$8hD6kDe5niwcZZrCZd.OdOm9FO.PVIl6QVoVH6CumxDZmmrLWKAxG"
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("password"))
	fmt.Println("Error:", err)
}
