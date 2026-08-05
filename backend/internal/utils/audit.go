package utils

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// LogAction inserts a record into the audit_logs table
// Example: LogAction(c, adminID, "staff", "DELETE_TEACHER", "Deleted teacher John Doe")
func LogAction(c *fiber.Ctx, userID int, userType string, action string, description string) {
	ip := c.IP()
	
	logEntry := models.AuditLog{
		UserID:      userID,
		UserType:    userType,
		Action:      action,
		Description: description,
		IPAddress:   ip,
		CreatedAt:   time.Now(),
	}

	if err := database.DB.Create(&logEntry).Error; err != nil {
		fmt.Printf("Failed to create audit log: %v\n", err)
	}
}
