package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// WebhookPayment is a stub for bank webhook callbacks
func WebhookPayment(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Webhook received"})
}
