package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

// ======================== YEARS ======================== //

func GetYears(c *fiber.Ctx) error {
	var years []models.Year
	if err := database.DB.Find(&years).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch years"})
	}
	return c.JSON(years)
}

func CreateYear(c *fiber.Ctx) error {
	var year models.Year
	if err := c.BodyParser(&year); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := database.DB.Create(&year).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create year"})
	}

	utils.LogAction(c, 0, "system", "CREATE_YEAR", "Created year: "+year.YearName)
	return c.Status(201).JSON(year)
}

func UpdateYear(c *fiber.Ctx) error {
	id := c.Params("id")
	var year models.Year
	if err := database.DB.First(&year, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Year not found"})
	}

	if err := c.BodyParser(&year); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	database.DB.Save(&year)
	utils.LogAction(c, 0, "system", "UPDATE_YEAR", "Updated year: "+year.YearName)
	return c.JSON(year)
}

func DeleteYear(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Year{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete year"})
	}
	utils.LogAction(c, 0, "system", "DELETE_YEAR", "Deleted year ID: "+id)
	return c.JSON(fiber.Map{"message": "Year deleted successfully"})
}

// ======================== SEMESTERS ======================== //

func GetSemesters(c *fiber.Ctx) error {
	var semesters []models.Semester
	if err := database.DB.Find(&semesters).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch semesters"})
	}
	return c.JSON(semesters)
}

func CreateSemester(c *fiber.Ctx) error {
	var semester models.Semester
	if err := c.BodyParser(&semester); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// If marked as ACTIVE, set all others to INACTIVE first (business rule: only 1 active semester)
	if semester.Status == "ACTIVE" {
		database.DB.Model(&models.Semester{}).Where("status = ?", "ACTIVE").Update("status", "INACTIVE")
	}

	if err := database.DB.Create(&semester).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create semester"})
	}

	utils.LogAction(c, 0, "system", "CREATE_SEMESTER", "Created semester: "+semester.SemesterName)
	return c.Status(201).JSON(semester)
}

func UpdateSemester(c *fiber.Ctx) error {
	id := c.Params("id")
	var semester models.Semester
	if err := database.DB.First(&semester, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Semester not found"})
	}

	if err := c.BodyParser(&semester); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if semester.Status == "ACTIVE" {
		// Deactivate others
		database.DB.Model(&models.Semester{}).Where("id != ? AND status = ?", id, "ACTIVE").Update("status", "INACTIVE")
	}

	database.DB.Save(&semester)
	utils.LogAction(c, 0, "system", "UPDATE_SEMESTER", "Updated semester: "+semester.SemesterName)
	return c.JSON(semester)
}

func DeleteSemester(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Semester{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete semester"})
	}
	utils.LogAction(c, 0, "system", "DELETE_SEMESTER", "Deleted semester ID: "+id)
	return c.JSON(fiber.Map{"message": "Semester deleted successfully"})
}

// ======================== TUITION FEES ======================== //

func GetTuitionFees(c *fiber.Ctx) error {
	var fees []models.TuitionFee
	if err := database.DB.Preload("Year").Find(&fees).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch tuition fees"})
	}
	return c.JSON(fees)
}

func SetTuitionFee(c *fiber.Ctx) error {
	var input struct {
		YearID     int     `json:"year_id"`
		TuitionFee float64 `json:"tuition_fee"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var fee models.TuitionFee
	// Upsert Logic
	result := database.DB.Where("year_id = ?", input.YearID).First(&fee)
	
	fee.YearID = input.YearID
	fee.TuitionFee = input.TuitionFee

	if result.Error != nil { // Not found, create new
		database.DB.Create(&fee)
		utils.LogAction(c, 0, "system", "SET_FEE", fmt.Sprintf("Created fee for YearID %d", fee.YearID))
	} else {
		database.DB.Save(&fee)
		utils.LogAction(c, 0, "system", "UPDATE_FEE", fmt.Sprintf("Updated fee for YearID %d", fee.YearID))
	}

	// Reload with Year relation
	database.DB.Preload("Year").First(&fee, fee.ID)

	return c.JSON(fee)
}
