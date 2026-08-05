package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// GetTeachers retrieves all admins with role 'teacher', including their profile
func GetTeachers(c *fiber.Ctx) error {
	var teachers []models.Admin

	result := database.DB.Preload("TeacherProfile").Where("role = ?", "teacher").Find(&teachers)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch teachers"})
	}

	return c.Status(fiber.StatusOK).JSON(teachers)
}

// GetStaff retrieves all admins with role 'officer', 'admin', or 'super'
func GetStaff(c *fiber.Ctx) error {
	var staff []models.Admin

	result := database.DB.Where("role IN ?", []string{"officer", "admin", "super"}).Find(&staff)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch staff"})
	}

	return c.Status(fiber.StatusOK).JSON(staff)
}

// CreateAdmin creates a new personnel (Super Admin, Admin, Officer, or Teacher)
func CreateAdmin(c *fiber.Ctx) error {
	var input struct {
		Username     string `json:"username"`
		Password     string `json:"password"`
		Name         string `json:"name"`
		Fullname     string `json:"fullname"`
		Email        string `json:"email"`
		Role         string `json:"role"`
		PassportName string `json:"passport_name"`
		Biography    string `json:"biography"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if input.Username == "" || input.Password == "" || input.Role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username, Password, and Role are required"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	admin := models.Admin{
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		Name:         input.Name,
		Fullname:     input.Fullname,
		Email:        input.Email,
		Role:         input.Role,
		PassportName: input.PassportName,
		Photo:        "default.png",
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user. Username might already exist."})
	}

	// If role is teacher, create a TeacherProfile
	if input.Role == "teacher" {
		profile := models.TeacherProfile{
			AdminID: admin.ID,
			Profile: input.Biography,
		}
		database.DB.Create(&profile)
	}

	utils.LogAction(c, 0, "system", "CREATE_ADMIN", "Created new personnel: "+admin.Username)

	return c.Status(fiber.StatusCreated).JSON(admin)
}

// UpdateAdmin updates a personnel record
func UpdateAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var admin models.Admin

	if err := database.DB.Preload("TeacherProfile").First(&admin, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	var input struct {
		Username     string `json:"username"`
		Password     string `json:"password"` // Optional
		Name         string `json:"name"`
		Fullname     string `json:"fullname"`
		Email        string `json:"email"`
		Role         string `json:"role"`
		PassportName string `json:"passport_name"`
		Biography    string `json:"biography"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	// Update fields
	if input.Username != "" {
		admin.Username = input.Username
	}
	if input.Name != "" {
		admin.Name = input.Name
	}
	if input.Fullname != "" {
		admin.Fullname = input.Fullname
	}
	if input.Email != "" {
		admin.Email = input.Email
	}
	if input.Role != "" {
		admin.Role = input.Role
	}
	if input.PassportName != "" {
		admin.PassportName = input.PassportName
	}

	// Update password if provided
	if input.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
		if err == nil {
			admin.PasswordHash = string(hashedPassword)
		}
	}

	database.DB.Save(&admin)

	// Update teacher profile if role is teacher
	if admin.Role == "teacher" {
		var profile models.TeacherProfile
		if err := database.DB.Where("admin_id = ?", admin.ID).First(&profile).Error; err != nil {
			// Create if not exists
			profile = models.TeacherProfile{
				AdminID: admin.ID,
				Profile: input.Biography,
			}
			database.DB.Create(&profile)
		} else {
			profile.Profile = input.Biography
			database.DB.Save(&profile)
		}
	} else {
		// If role changed from teacher to something else, we might want to delete the profile
		database.DB.Where("admin_id = ?", admin.ID).Delete(&models.TeacherProfile{})
	}

	utils.LogAction(c, 0, "system", "UPDATE_ADMIN", "Updated personnel: "+admin.Username)

	return c.JSON(admin)
}

// DeleteAdmin deletes a personnel record
func DeleteAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	
	// Delete teacher profile first due to foreign key
	database.DB.Where("admin_id = ?", id).Delete(&models.TeacherProfile{})
	
	result := database.DB.Delete(&models.Admin{}, id)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete user"})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	utils.LogAction(c, 0, "system", "DELETE_ADMIN", "Deleted personnel ID: "+id)

	return c.JSON(fiber.Map{"message": "User successfully deleted"})
}
