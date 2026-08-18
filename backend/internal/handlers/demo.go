package handlers

import (
	"backend/internal/database"

	"github.com/gofiber/fiber/v2"
)

// ResetDemoDB drops the database file entirely (or drops tables) and recreates everything from scratch
func ResetDemoDB(c *fiber.Ctx) error {
	// In SQLite with GORM, dropping all tables automatically isn't natively supported by a single command.
	// But since it's a demo mode on Render ephemeral disk, we can just reconnect which triggers AutoMigrate,
	// but to actually drop we'd need to drop the file or drop each table.
	// A simpler way for a portfolio demo that resets is to just restart the Render instance,
	// BUT if we want an API:
	
	// Since Render restarts automatically clear the SQLite DB, this endpoint is just an explicit way 
	// to trigger the seeder if it somehow got emptied without a restart.
	// To actually drop all tables in SQLite:
	database.DB.Exec("PRAGMA writable_schema = 1; DELETE FROM sqlite_master; PRAGMA writable_schema = 0; VACUUM; PRAGMA integrity_check;")
	
	// Re-run connection and migration
	database.ConnectDB()

	return c.JSON(fiber.Map{
		"message": "Demo Database has been reset and re-seeded successfully.",
	})
}
