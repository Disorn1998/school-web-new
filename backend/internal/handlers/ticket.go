package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GetAllTickets(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)
	userID := int(user["id"].(float64))

	var tickets []models.SupportTicket
	query := database.DB.Order("created_at desc")

	if role == "student" || role == "parent" {
		query = query.Where("created_by_id = ? AND created_by_type = ?", userID, "Student")
	}

	if err := query.Find(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch tickets"})
	}

	return c.JSON(tickets)
}

func CreateTicket(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)
	userID := int(user["id"].(float64))

	var req models.SupportTicket
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Generate Ticket No
	count := int64(0)
	database.DB.Model(&models.SupportTicket{}).Count(&count)
	req.TicketNo = fmt.Sprintf("TKT-%s-%04d", time.Now().Format("0601"), count+1)
	
	req.CreatedByID = userID
	req.CreatedByType = "Admin"
	if role == "student" || role == "parent" {
		req.CreatedByType = "Student"
	}

	if req.Status == "" {
		req.Status = "Open"
	}
	if req.Priority == "" {
		req.Priority = "Medium"
	}

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create ticket"})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

func UpdateTicketStatus(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	role := user["role"].(string)

	if role == "student" || role == "parent" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var ticket models.SupportTicket
	if err := database.DB.First(&ticket, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Ticket not found"})
	}

	ticket.Status = req.Status
	if err := database.DB.Save(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update ticket"})
	}

	return c.JSON(ticket)
}
