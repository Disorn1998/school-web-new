package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// ConnectDB connects to the database and assigns it to the DB variable
func ConnectDB() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	sslmode := os.Getenv("DB_SSLMODE")
	timezone := os.Getenv("DB_TIMEZONE")

	if user == "" {
		log.Fatal("Error: DB_USER is empty. Please check your .env file.")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, dbname, port, sslmode, timezone)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Database Connection Failed: ", err)
	}

	DB = db
	log.Println("Connected to the Database Successfully")
}
