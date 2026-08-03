package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// LoginInput struct for parsing the JSON request body
type LoginInput struct {
	AuthGroup string `json:"auth_group"` // 'staff' or 'student'
	Username  string `json:"username"`
	Password  string `json:"password"`
}

// Login handles user authentication and returns a JWT
func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if input.Username == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Please fill in all required fields"})
	}

	// JWT Secret
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-default-key" // Fallback, should be in .env
	}

	// 1. Staff (Admins, Teachers, Officers)
	if input.AuthGroup == "staff" {
		var admin models.Admin
		if err := database.DB.Where("username = ?", input.Username).First(&admin).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
		}

		// Verify Password
		dbPassword := admin.Password
		if admin.PasswordHash != "" {
			dbPassword = admin.PasswordHash
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(input.Password)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
		}

		// Generate JWT Token
		claims := jwt.MapClaims{
			"id":       admin.ID,
			"username": admin.Username,
			"role":     admin.Role,
			"group":    "staff",
			"exp":      time.Now().Add(time.Hour * 72).Unix(),
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		t, err := token.SignedString([]byte(jwtSecret))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not login"})
		}

		return c.JSON(fiber.Map{
			"message": "Login successful",
			"token":   t,
			"user": fiber.Map{
				"id":       admin.ID,
				"fullname": admin.Fullname,
				"role":     admin.Role,
				"photo":    admin.Photo,
			},
		})
	}

	// 2. Student / Parent
	// The PHP code joins parents and students. We will do the same.
	type ParentStudentResult struct {
		ParentID  int    `gorm:"column:parent_id"`
		StudentID int    `gorm:"column:student_id"`
		YearID    int    `gorm:"column:year_id"`
		Fullname  string `gorm:"column:fullname"`
		Password  string `gorm:"column:password_hash"`
	}

	var result ParentStudentResult
	query := `
		SELECT p.id as parent_id, s.id as student_id, s.year_id, s.fullname, p.password_hash
		FROM parents p
		JOIN students s ON s.parent_id = p.id
		WHERE p.username = ?
		LIMIT 1
	`

	if err := database.DB.Raw(query, input.Username).Scan(&result).Error; err != nil || result.ParentID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
	}

	// Verify Password
	if err := bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
	}

	// Update Login stats
	device := "Desktop"
	userAgent := string(c.Request().Header.UserAgent())
	// Very simple user agent check for mobile
	if len(userAgent) > 0 {
		device = "Unknown" // Can implement better detection if needed
	}

	database.DB.Exec("UPDATE parents SET login_count = login_count + 1, last_login = NOW(), last_device = ? WHERE id = ?", device, result.ParentID)

	// Generate JWT Token
	claims := jwt.MapClaims{
		"id":        result.StudentID,
		"parent_id": result.ParentID,
		"group":     "student",
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not login"})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   t,
		"user": fiber.Map{
			"id":       result.StudentID,
			"fullname": result.Fullname,
			"year_id":  result.YearID,
		},
	})
}
