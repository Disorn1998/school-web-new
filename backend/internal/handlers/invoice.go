package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GenerateInvoices handles bulk creation of invoices
func GenerateInvoices(c *fiber.Ctx) error {
	type InvoiceRequest struct {
		IssueDate  string  `json:"issue_date"`
		DueDate    string  `json:"due_date"`
		SemesterID int     `json:"semester_id"`
		LateFee    float64 `json:"late_fee"`
		StudentIDs []int   `json:"student_ids"`
		Items      []struct {
			Description string  `json:"description"`
			Amount      float64 `json:"amount"`
		} `json:"items"`
	}

	var req InvoiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Amount
	}

	// Start a transaction since we are inserting multiple records
	tx := database.DB.Begin()

	var createdInvoices []models.Invoice

	for _, studentID := range req.StudentIDs {
		// Generate a unique invoice number (e.g., INV-YYYYMMDD-StudentID)
		invoiceNo := fmt.Sprintf("INV-%s-%d", time.Now().Format("20060102150405"), studentID)

		invoice := models.Invoice{
			InvoiceNo:   invoiceNo,
			StudentID:   studentID,
			SemesterID:  req.SemesterID,
			IssueDate:   req.IssueDate,
			DueDate:     req.DueDate,
			LateFee:     req.LateFee,
			TotalAmount: totalAmount,
			Status:      "Pending",
		}

		if err := tx.Create(&invoice).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create invoice"})
		}

		// Insert Invoice Items
		for _, item := range req.Items {
			invoiceItem := models.InvoiceItem{
				InvoiceID:   invoice.ID,
				Description: item.Description,
				Amount:      item.Amount,
			}
			if err := tx.Create(&invoiceItem).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create invoice items"})
			}
		}

		createdInvoices = append(createdInvoices, invoice)
	}

	tx.Commit()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  fmt.Sprintf("Successfully generated %d invoices", len(createdInvoices)),
		"invoices": createdInvoices,
	})
}

// GetAllInvoices returns all invoices
func GetAllInvoices(c *fiber.Ctx) error {
	var invoices []models.Invoice

	if err := database.DB.Preload("Student").Preload("Semester").Preload("Items").Find(&invoices).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch invoices"})
	}

	return c.JSON(invoices)
}

// WebhookPayment receives payment confirmation from Bank/Gateway
// Replaces api/webhook_payment.php
func WebhookPayment(c *fiber.Ctx) error {
	type WebhookPayload struct {
		Ref1   string  `json:"ref1"` // This matches InvoiceNo
		Amount float64 `json:"amount"`
	}

	var payload WebhookPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}

	// 1. Find the invoice by InvoiceNo (Ref1)
	var invoice models.Invoice
	if err := database.DB.Where("invoice_no = ?", payload.Ref1).First(&invoice).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Invoice not found"})
	}

	// 2. Validate amount (optional, but good practice)
	// if payload.Amount < invoice.TotalAmount {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Insufficient amount"})
	// }

	// 3. Update Invoice status to Paid
	if err := database.DB.Model(&invoice).Updates(map[string]interface{}{
		"status":  "Paid",
		"paid_at": time.Now(),
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update invoice"})
	}

	return c.JSON(fiber.Map{
		"message": "Payment recorded successfully",
		"invoice": invoice,
	})
}
