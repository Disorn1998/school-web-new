package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/promptpay"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GetShopItems(c *fiber.Ctx) error {
	var items []models.ShopItem
	if err := database.DB.Preload("Category").Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch shop items"})
	}
	return c.JSON(items)
}

func CreateShopItem(c *fiber.Ctx) error {
	var req models.ShopItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create item"})
	}
	return c.Status(fiber.StatusCreated).JSON(req)
}

func GetShopCategories(c *fiber.Ctx) error {
	var categories []models.ShopCategory
	if err := database.DB.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch categories"})
	}
	return c.JSON(categories)
}

func CreateShopCategory(c *fiber.Ctx) error {
	var req models.ShopCategory
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create category"})
	}
	return c.Status(fiber.StatusCreated).JSON(req)
}

func PlaceShopOrder(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	
	var req struct {
		StudentID int `json:"student_id"`
		Items []struct {
			ItemID   int `json:"item_id"`
			Quantity int `json:"quantity"`
		} `json:"items"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	studentID := req.StudentID
	if user["role"] == "student" {
		studentID = int(user["id"].(float64))
	} else if studentID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "student_id is required"})
	}

	tx := database.DB.Begin()

	// Generate Order No
	count := int64(0)
	tx.Model(&models.ShopOrder{}).Count(&count)
	order := models.ShopOrder{
		OrderNo:   fmt.Sprintf("ORD-%s-%04d", time.Now().Format("0601"), count+1),
		StudentID: studentID,
		Status:    "Pending Payment",
		Total:     0,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create order"})
	}

	totalAmount := 0.0

	for _, cartItem := range req.Items {
		var item models.ShopItem
		if err := tx.First(&item, cartItem.ItemID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Item not found"})
		}

		if item.StockQty < cartItem.Quantity {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Not enough stock for " + item.Name})
		}

		// Deduct stock
		item.StockQty -= cartItem.Quantity
		tx.Save(&item)

		orderItem := models.ShopOrderItem{
			OrderID:  order.ID,
			ItemID:   item.ID,
			Quantity: cartItem.Quantity,
			Price:    item.Price,
		}
		if err := tx.Create(&orderItem).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create order item"})
		}

		totalAmount += item.Price * float64(cartItem.Quantity)
	}

	order.Total = totalAmount
	tx.Save(&order)

	tx.Commit()

	return c.Status(fiber.StatusCreated).JSON(order)
}

func GetShopOrders(c *fiber.Ctx) error {
	var orders []models.ShopOrder
	if err := database.DB.Preload("Items.Item").Preload("Student").Order("created_at desc").Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch orders"})
	}
	return c.JSON(orders)
}

func GetStudentShopOrders(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	studentID := int(user["id"].(float64))

	if c.Query("student_id") != "" && user["role"] == "parent" {
		parsed, _ := strconv.Atoi(c.Query("student_id"))
		studentID = parsed
	}

	var orders []models.ShopOrder
	if err := database.DB.Preload("Items.Item").Where("student_id = ?", studentID).Order("created_at desc").Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch orders"})
	}
	return c.JSON(orders)
}

// GenerateOrderQR generates a PromptPay QR for a shop order
func GenerateOrderQR(c *fiber.Ctx) error {
	id := c.Params("id")
	var order models.ShopOrder
	if err := database.DB.First(&order, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	schoolPromptPayID := "0904982968"

	png, err := promptpay.GenerateQRImage(schoolPromptPayID, order.Total, 256)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate QR Code"})
	}

	c.Set("Content-Type", "image/png")
	return c.Send(png)
}

