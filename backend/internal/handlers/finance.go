package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GenerateInvoices auto-generates invoices for a specific year level
func GenerateInvoices(c *fiber.Ctx) error {
	var input struct {
		SemesterID       int     `json:"semester_id"`
		YearID           int     `json:"year_id"`
		InvoiceType      string  `json:"invoice_type"`
		IssueDate        string  `json:"issue_date"`
		DueDate          string  `json:"due_date"`
		CommencementDate string  `json:"commencement_date"`
		EndDate          string  `json:"end_date"`
		LateFee          float64 `json:"late_fee"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// 1. Get Base Tuition Fee
	var fee models.TuitionFee
	if err := database.DB.Where("year_id = ?", input.YearID).First(&fee).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Tuition fee not set for this year level. Please configure it in Academic Settings."})
	}

	// 2. Get active students in that year
	var students []models.Student
	if err := database.DB.Where("year_id = ?", input.YearID).Find(&students).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch students"})
	}

	if len(students) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No students found in this year level."})
	}

	// 3. Create Invoice Header
	header := models.InvoiceHeader{
		InvoiceNo:        fmt.Sprintf("INV-%d-%d", time.Now().Year(), time.Now().Unix()),
		InvoiceType:      input.InvoiceType,
		IssueDate:        input.IssueDate,
		DueDate:          input.DueDate,
		SemesterID:       input.SemesterID,
		YearID:           input.YearID,
		CommencementDate: input.CommencementDate,
		EndDate:          input.EndDate,
		LateFee:          input.LateFee,
	}

	tx := database.DB.Begin()

	if err := tx.Create(&header).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create invoice header"})
	}

	// 4. Create Invoice for each student
	for _, student := range students {
		var subtotal = fee.TuitionFee
		var finalTotal = fee.TuitionFee

		// Check for discount
		var discount models.StudentDiscount
		hasDiscount := false
		if err := tx.Where("student_id = ?", student.ID).First(&discount).Error; err == nil && discount.DiscountAmount > 0 {
			hasDiscount = true
			finalTotal -= discount.DiscountAmount
		}

		invoice := models.Invoice{
			InvoiceHeaderID: header.ID,
			StudentID:       student.ID,
			Subtotal:        subtotal,
			Total:           finalTotal,
			Status:          "UNPAID",
		}
		if err := tx.Create(&invoice).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create invoice"})
		}

		// Line Item
		item := models.InvoiceItem{
			InvoiceID: invoice.ID,
			ItemName:  "Tuition Fee",
			Amount:    subtotal,
		}
		tx.Create(&item)

		if hasDiscount {
			discountItem := models.InvoiceItem{
				InvoiceID: invoice.ID,
				ItemName:  "Credit - " + discount.Remark,
				Amount:    -discount.DiscountAmount,
			}
			tx.Create(&discountItem)
			// Delete the discount after applying it (one-time use)
			tx.Delete(&discount)
		}
	}

	tx.Commit()
	utils.LogAction(c, 0, "system", "GENERATE_INVOICES", fmt.Sprintf("Generated %d invoices for Year ID %d", len(students), input.YearID))

	return c.JSON(fiber.Map{"message": fmt.Sprintf("Successfully generated %d invoices.", len(students))})
}

// GetAllInvoices fetches all invoices (Admin)
func GetAllInvoices(c *fiber.Ctx) error {
	var invoices []models.Invoice
	if err := database.DB.Preload("Student").Preload("Header").Preload("Header.Semester").Preload("Header.Year").Preload("Payment").Find(&invoices).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch invoices"})
	}
	return c.JSON(invoices)
}

// GetMyInvoices fetches invoices for a student (Student Portal)
func GetMyInvoices(c *fiber.Ctx) error {
	var studentID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		studentID = int(claims["id"].(float64))
		
		if parentIDVal, ok := claims["parent_id"].(float64); ok {
			parentID := int(parentIDVal)
			if queryID := c.QueryInt("student_id", 0); queryID != 0 {
				var count int64
				database.DB.Model(&models.Student{}).Where("id = ? AND parent_id = ?", queryID, parentID).Count(&count)
				if count > 0 {
					studentID = queryID
				}
			}
		}
	} else {
		// Fallback for manual testing
		studentID = c.QueryInt("student_id")
	}

	var invoices []models.Invoice
	if err := database.DB.Preload("Header").Preload("Header.Semester").Preload("Items").Preload("Payment").Where("student_id = ?", studentID).Find(&invoices).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch invoices"})
	}
	return c.JSON(invoices)
}

// UploadPaymentSlip allows parent to upload PromptPay slip
func UploadPaymentSlip(c *fiber.Ctx) error {
	invoiceID := c.FormValue("invoice_id")
	amount := c.FormValue("amount")
	queryStudentID := c.FormValue("student_id")

	if invoiceID == "" || amount == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Invoice ID and Amount are required"})
	}

	var studentID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		studentID = int(claims["id"].(float64))
		
		if parentIDVal, ok := claims["parent_id"].(float64); ok && queryStudentID != "" {
			parentID := int(parentIDVal)
			var count int64
			database.DB.Model(&models.Student{}).Where("id = ? AND parent_id = ?", queryStudentID, parentID).Count(&count)
			if count > 0 {
				studentID = 0 // Validated, but invoice_id is what matters anyway
			}
		}
	} else {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	file, err := c.FormFile("slip_image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Slip image is required"})
	}

	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "File size exceeds 5MB limit"})
	}

	fileHeader, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file"})
	}
	defer fileHeader.Close()

	buff := make([]byte, 512)
	if _, err := fileHeader.Read(buff); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read file contents"})
	}

	fileType := http.DetectContentType(buff)
	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "application/pdf" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid file type. Only JPEG, PNG, and PDF are allowed."})
	}

	// Generate unique filename
	filename := uuid.New().String() + filepath.Ext(file.Filename)
	savePath := fmt.Sprintf("./uploads/%s", filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Find existing invoice and verify ownership
	var invoice models.Invoice
	if err := database.DB.Where("id = ? AND student_id = ?", invoiceID, studentID).First(&invoice).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Invoice not found or unauthorized"})
	}

	// Prevent Double Payments
	if invoice.Status != "UNPAID" {
		return c.Status(400).JSON(fiber.Map{"error": "This invoice is already paid or pending verification."})
	}

	// Create Payment record
	payment := models.Payment{
		InvoiceID: invoice.ID,
		SlipImage: "/uploads/" + filename,
		Amount:    invoice.Total, // Use expected total or parsed amount
		Status:    "PENDING",
	}

	if err := database.DB.Create(&payment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create payment record"})
	}

	// Update Invoice Status
	database.DB.Model(&invoice).Update("status", "PENDING")

	return c.JSON(fiber.Map{
		"message": "Payment slip uploaded successfully",
		"payment": payment,
	})
}

// ApprovePayment allows Admin to verify and approve a slip
func ApprovePayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")

	var payment models.Payment
	if err := database.DB.First(&payment, paymentID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Payment not found"})
	}

	if payment.Status != "PENDING" {
		return c.Status(400).JSON(fiber.Map{"error": "Payment is not in pending state"})
	}

	tx := database.DB.Begin()

	now := time.Now()
	payment.Status = "APPROVED"
	payment.VerifiedAt = &now
	if err := tx.Save(&payment).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update payment"})
	}

	// Update Invoice
	var invoice models.Invoice
	if err := tx.First(&invoice, payment.InvoiceID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Invoice not found"})
	}

	invoice.Status = "PAID"
	invoice.PaymentMethod = "PromptPay"
	invoice.PaidAt = &now
	if err := tx.Save(&invoice).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update invoice"})
	}

	tx.Commit()

	var adminID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		adminID = int(claims["id"].(float64))
	}
	utils.LogAction(c, adminID, "admin", "APPROVE_PAYMENT", fmt.Sprintf("Approved payment %s for Invoice %d", paymentID, invoice.ID))

	return c.JSON(fiber.Map{"message": "Payment approved successfully"})
}

// GenerateCustomInvoices generates invoices for specific students with custom items
func GenerateCustomInvoices(c *fiber.Ctx) error {
	var input struct {
		SemesterID       int       `json:"semester_id"`
		YearID           int       `json:"year_id"`
		InvoiceType      string    `json:"invoice_type"`
		IssueDate        string    `json:"issue_date"`
		DueDate          string    `json:"due_date"`
		CommencementDate string    `json:"commencement_date"`
		EndDate          string    `json:"end_date"`
		LateFee          float64   `json:"late_fee"`
		StudentIDs       []int     `json:"student_ids"`
		Items            []struct {
			ItemName string  `json:"item_name"`
			Amount   float64 `json:"amount"`
		} `json:"items"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if len(input.StudentIDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No students selected"})
	}

	if len(input.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "At least one line item is required"})
	}

	// Calculate total per invoice
	var totalAmount float64
	for _, item := range input.Items {
		totalAmount += item.Amount
	}

	tx := database.DB.Begin()

	// Create Invoice Header
	header := models.InvoiceHeader{
		InvoiceNo:        fmt.Sprintf("INV-C-%d-%d", time.Now().Year(), time.Now().Unix()),
		InvoiceType:      input.InvoiceType,
		IssueDate:        input.IssueDate,
		DueDate:          input.DueDate,
		SemesterID:       input.SemesterID,
		YearID:           input.YearID,
		CommencementDate: input.CommencementDate,
		EndDate:          input.EndDate,
		LateFee:          input.LateFee,
	}

	if err := tx.Create(&header).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create invoice header"})
	}

	// Create Invoice and Items for each selected student
	for _, studentID := range input.StudentIDs {
		var finalTotal = totalAmount

		// Check for discount
		var discount models.StudentDiscount
		hasDiscount := false
		if err := tx.Where("student_id = ?", studentID).First(&discount).Error; err == nil && discount.DiscountAmount > 0 {
			hasDiscount = true
			finalTotal -= discount.DiscountAmount
		}

		invoice := models.Invoice{
			InvoiceHeaderID: header.ID,
			StudentID:       studentID,
			Subtotal:        totalAmount,
			Total:           finalTotal,
			Status:          "UNPAID",
		}
		if err := tx.Create(&invoice).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create invoice for student ID " + fmt.Sprint(studentID)})
		}

		for _, itemInput := range input.Items {
			item := models.InvoiceItem{
				InvoiceID: invoice.ID,
				ItemName:  itemInput.ItemName,
				Amount:    itemInput.Amount,
			}
			if err := tx.Create(&item).Error; err != nil {
				tx.Rollback()
				return c.Status(500).JSON(fiber.Map{"error": "Failed to create invoice items"})
			}
		}

		if hasDiscount {
			discountItem := models.InvoiceItem{
				InvoiceID: invoice.ID,
				ItemName:  "Credit - " + discount.Remark,
				Amount:    -discount.DiscountAmount,
			}
			tx.Create(&discountItem)
			tx.Delete(&discount)
		}
	}

	tx.Commit()

	var adminID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		adminID = int(claims["id"].(float64))
	}
	utils.LogAction(c, adminID, "admin", "GENERATE_CUSTOM_INVOICES", fmt.Sprintf("Generated %d custom invoices for Year ID %d", len(input.StudentIDs), input.YearID))

	return c.JSON(fiber.Map{"message": fmt.Sprintf("Successfully generated %d custom invoices.", len(input.StudentIDs))})
}

// GetStudentDiscounts retrieves all pending discounts
func GetStudentDiscounts(c *fiber.Ctx) error {
	var discounts []models.StudentDiscount
	if err := database.DB.Preload("Student").Preload("Student.Year").Find(&discounts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch discounts"})
	}
	return c.JSON(discounts)
}

// AddStudentDiscount adds a new discount for a student
func AddStudentDiscount(c *fiber.Ctx) error {
	var input struct {
		StudentID      int     `json:"student_id"`
		DiscountAmount float64 `json:"discount_amount"`
		Remark         string  `json:"remark"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if input.StudentID == 0 || input.DiscountAmount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Student ID and valid amount required"})
	}

	discount := models.StudentDiscount{
		StudentID:      input.StudentID,
		DiscountAmount: input.DiscountAmount,
		Remark:         input.Remark,
	}

	if err := database.DB.Create(&discount).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save discount"})
	}

	return c.JSON(fiber.Map{"message": "Discount added successfully", "discount": discount})
}

// DeleteStudentDiscount removes a pending discount
func DeleteStudentDiscount(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.StudentDiscount{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete discount"})
	}
	return c.JSON(fiber.Map{"message": "Discount deleted successfully"})
}

// EditInvoice updates an existing unpaid invoice (issue date, due date, late fee, and line items)
func EditInvoice(c *fiber.Ctx) error {
	invoiceID := c.Params("id")

	var input struct {
		IssueDate        string    `json:"issue_date"`
		DueDate          string    `json:"due_date"`
		CommencementDate string    `json:"commencement_date"`
		EndDate          string    `json:"end_date"`
		LateFee          float64   `json:"late_fee"`
		Items            []struct {
			ItemName string  `json:"item_name"`
			Amount   float64 `json:"amount"`
		} `json:"items"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	tx := database.DB.Begin()

	// Find the invoice
	var invoice models.Invoice
	if err := tx.Preload("Header").First(&invoice, invoiceID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Invoice not found"})
	}

	if invoice.Status == "PAID" || invoice.Status == "PENDING" {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Cannot edit an invoice that is already paid or pending verification"})
	}

	// Update Header
	header := invoice.Header
	header.IssueDate = input.IssueDate
	header.DueDate = input.DueDate
	header.CommencementDate = input.CommencementDate
	header.EndDate = input.EndDate
	header.LateFee = input.LateFee

	if err := tx.Save(&header).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update invoice header"})
	}

	// Delete existing items
	if err := tx.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to clear old items"})
	}

	// Insert new items
	var newSubtotal float64
	for _, itemInput := range input.Items {
		item := models.InvoiceItem{
			InvoiceID: invoice.ID,
			ItemName:  itemInput.ItemName,
			Amount:    itemInput.Amount,
		}
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save new items"})
		}
		newSubtotal += itemInput.Amount
	}

	// Update Invoice Total
	invoice.Subtotal = newSubtotal
	invoice.Total = newSubtotal
	if err := tx.Save(&invoice).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update invoice totals"})
	}

	tx.Commit()

	var adminID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		adminID = int(claims["id"].(float64))
	}
	utils.LogAction(c, adminID, "admin", "EDIT_INVOICE", fmt.Sprintf("Edited invoice %s", invoiceID))

	return c.JSON(fiber.Map{"message": "Invoice updated successfully"})
}

// DeleteInvoice deletes an existing unpaid invoice
func DeleteInvoice(c *fiber.Ctx) error {
	invoiceID := c.Params("id")

	tx := database.DB.Begin()

	var invoice models.Invoice
	if err := tx.First(&invoice, invoiceID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Invoice not found"})
	}

	if invoice.Status == "PAID" || invoice.Status == "PENDING" {
		tx.Rollback()
		return c.Status(400).JSON(fiber.Map{"error": "Cannot delete an invoice that is already paid or pending verification"})
	}

	// Delete items
	if err := tx.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete items"})
	}

	// Delete invoice
	if err := tx.Delete(&invoice).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete invoice"})
	}
	
	tx.Commit()

	var adminID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		adminID = int(claims["id"].(float64))
	}
	utils.LogAction(c, adminID, "admin", "DELETE_INVOICE", fmt.Sprintf("Deleted invoice %s", invoiceID))

	return c.JSON(fiber.Map{"message": "Invoice deleted successfully"})
}

// GetPaymentReports fetches summary reports of paid invoices
func GetPaymentReports(c *fiber.Ctx) error {
	dateStart := c.Query("date_start", time.Now().Format("2006-01")+"-01") // First day of current month
	dateEnd := c.Query("date_end", time.Now().Format("2006-01-02")) // Today
	paymentMethod := c.Query("payment_method", "")
	searchQuery := c.Query("search", "")

	query := database.DB.Model(&models.Invoice{}).
		Preload("Header").
		Preload("Header.Semester").
		Preload("Student").
		Where("status = ?", "PAID").
		Where("DATE(paid_at) >= ? AND DATE(paid_at) <= ?", dateStart, dateEnd)

	if paymentMethod != "" {
		query = query.Where("payment_method = ?", paymentMethod)
	}

	if searchQuery != "" {
		query = query.Joins("JOIN students ON students.id = invoices.student_id").
			Joins("JOIN invoice_headers ON invoice_headers.id = invoices.invoice_header_id").
			Where("students.fullname LIKE ? OR students.student_id LIKE ? OR invoice_headers.invoice_no LIKE ?", "%"+searchQuery+"%", "%"+searchQuery+"%", "%"+searchQuery+"%")
	}

	var invoices []models.Invoice
	if err := query.Order("paid_at DESC").Find(&invoices).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch payment reports"})
	}

	return c.JSON(invoices)
}

// ----------------------------------------------------------------------------
// REMINDER SYSTEM
// ----------------------------------------------------------------------------

func GetReminderMessages(c *fiber.Ctx) error {
	var messages []models.ReminderMessage
	if err := database.DB.Order("id DESC").Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}
	return c.JSON(messages)
}

func AddReminderMessage(c *fiber.Ctx) error {
	var input struct {
		MessageText string `json:"message_text"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	msg := models.ReminderMessage{MessageText: input.MessageText}
	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save message"})
	}

	return c.JSON(fiber.Map{"message": "Message saved successfully"})
}

func UpdateReminderMessage(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		MessageText string `json:"message_text"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var msg models.ReminderMessage
	if err := database.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	msg.MessageText = input.MessageText
	database.DB.Save(&msg)
	return c.JSON(fiber.Map{"message": "Message updated successfully"})
}

func DeleteReminderMessage(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.ReminderMessage{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete message"})
	}
	return c.JSON(fiber.Map{"message": "Message deleted successfully"})
}

func GetReminderSchedules(c *fiber.Ctx) error {
	var schedules []models.ReminderSchedule
	if err := database.DB.Order("id DESC").Find(&schedules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch schedules"})
	}
	return c.JSON(schedules)
}

func SaveReminderSchedule(c *fiber.Ctx) error {
	var input struct {
		MessageIDs    string `json:"message_ids"`
		ScheduleType  string `json:"schedule_type"`
		FrequencyDays int    `json:"frequency_days"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	sch := models.ReminderSchedule{
		MessageIDs:    input.MessageIDs,
		ScheduleType:  input.ScheduleType,
		FrequencyDays: input.FrequencyDays,
	}

	if err := database.DB.Create(&sch).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save schedule"})
	}
	return c.JSON(fiber.Map{"message": "Schedule saved successfully"})
}

func UpdateReminderSchedule(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		MessageIDs    string `json:"message_ids"`
		ScheduleType  string `json:"schedule_type"`
		FrequencyDays int    `json:"frequency_days"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var sch models.ReminderSchedule
	if err := database.DB.First(&sch, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Schedule not found"})
	}

	sch.MessageIDs = input.MessageIDs
	sch.ScheduleType = input.ScheduleType
	sch.FrequencyDays = input.FrequencyDays

	database.DB.Save(&sch)
	return c.JSON(fiber.Map{"message": "Schedule updated successfully"})
}

func DeleteReminderSchedule(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.ReminderSchedule{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete schedule"})
	}
	return c.JSON(fiber.Map{"message": "Schedule deleted successfully"})
}

func TriggerSendReminders(c *fiber.Ctx) error {
	// Find all UNPAID invoices that are past due
	var invoices []models.Invoice
	nowStr := time.Now().Format("2006-01-02")
	
	err := database.DB.Preload("Student").Preload("Header").
		Where("status = ?", "UNPAID").
		Joins("JOIN invoice_headers ON invoice_headers.id = invoices.invoice_header_id").
		Where("invoice_headers.due_date < ?", nowStr).
		Find(&invoices).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to scan unpaid invoices"})
	}

	sentCount := 0
	for _, inv := range invoices {
		// Mock sending email
		fmt.Printf("[MAIL_QUEUE] Sent Reminder Email to: %s (Parent Email: %s) for Invoice: %s\n", inv.Student.Fullname, inv.Student.Email, inv.Header.InvoiceNo)
		sentCount++
	}

	var adminID int
	if userToken := c.Locals("user"); userToken != nil {
		claims := userToken.(jwt.MapClaims)
		adminID = int(claims["id"].(float64))
	}
	utils.LogAction(c, adminID, "admin", "TRIGGER_REMINDER", fmt.Sprintf("Triggered %d reminder emails", sentCount))

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Successfully scanned and triggered %d reminder emails (Simulated).", sentCount),
	})
}

