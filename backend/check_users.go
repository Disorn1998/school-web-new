package main

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Student struct {
	ID        int    `gorm:"primaryKey;column:id"`
	StudentID string `gorm:"column:student_id"`
	Password  string `gorm:"column:password"`
	Fullname  string `gorm:"column:fullname"`
}

func (Student) TableName() string {
	return "students"
}

type Admin struct {
	ID       int    `gorm:"primaryKey;column:id"`
	Username string `gorm:"column:username"`
	Fullname string `gorm:"column:fullname"`
}

func (Admin) TableName() string {
	return "admins"
}

func main() {
	db, err := gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	var student Student
	db.First(&student)
	fmt.Println("Student:")
	fmt.Println("ID:", student.StudentID)
	fmt.Println("Name:", student.Fullname)

	var admin Admin
	db.First(&admin)
	fmt.Println("\nAdmin:")
	fmt.Println("Username:", admin.Username)
	fmt.Println("Name:", admin.Fullname)
}
