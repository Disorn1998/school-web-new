package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$jH351DeYwwP.xWoFR.zOM.myaiImXsEP2oAEGRbf86SRxxM83e/Qq"
	password := "password123"

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println("Does NOT match:", err)
	} else {
		fmt.Println("MATCH!")
	}
	
	// Also check parent hash
	parentHash := "$2a$10$ggRhW8U/OSq6W4Xc6H2DTebsYrlm68Dwj1UeDPRIF4ZF5wxp6BAlS"
	err2 := bcrypt.CompareHashAndPassword([]byte(parentHash), []byte(password))
	if err2 != nil {
		fmt.Println("Parent does NOT match:", err2)
	} else {
		fmt.Println("Parent MATCH!")
	}
}
