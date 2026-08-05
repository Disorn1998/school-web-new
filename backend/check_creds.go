package main

import (
	"fmt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type Admin struct {
	Username string
	Role     string
}

type Parent struct {
	Username string
}

type Student struct {
	StudentID string
}

func main() {
	db, _ := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})

	var admin Admin
	db.Where("role = ?", "admin").First(&admin)
	fmt.Println("Admin Username:", admin.Username)

	var teacher Admin
	db.Where("role = ?", "teacher").First(&teacher)
	fmt.Println("Teacher Username:", teacher.Username)

	var parent Parent
	db.First(&parent)
	fmt.Println("Parent Username:", parent.Username)

	var student Student
	db.First(&student)
	fmt.Println("Student ID:", student.StudentID)
}
