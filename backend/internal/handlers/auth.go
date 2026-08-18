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

// checkBruteForce checks if the IP is locked out
func checkBruteForce(ip string, username string) (bool, time.Time) {
	var attempt models.LoginAttempt
	if err := database.DB.Where("ip_address = ? AND username = ?", ip, username).First(&attempt).Error; err == nil {
		if attempt.Attempts >= 5 && time.Now().Before(attempt.LockedUntil) {
			return true, attempt.LockedUntil
		}
	}
	return false, time.Time{}
}

// recordFailedLogin increments the failed login count
func recordFailedLogin(ip string, username string) {
	var attempt models.LoginAttempt
	if err := database.DB.Where("ip_address = ? AND username = ?", ip, username).First(&attempt).Error; err != nil {
		// Create new
		database.DB.Create(&models.LoginAttempt{
			Username:      username,
			IPAddress:     ip,
			Attempts:      1,
			LastAttemptAt: time.Now(),
		})
	} else {
		attempt.Attempts += 1
		attempt.LastAttemptAt = time.Now()
		if attempt.Attempts >= 5 {
			attempt.LockedUntil = time.Now().Add(15 * time.Minute)
		}
		database.DB.Save(&attempt)
	}
}

// recordSuccessfulLogin clears brute force locks and logs session
func recordSuccessfulLogin(ip, username, userAgent, userType string, userID int) {
	// Clear brute force
	database.DB.Where("ip_address = ? AND username = ?", ip, username).Delete(&models.LoginAttempt{})

	// Log Session
	database.DB.Create(&models.LoginHistory{
		UserID:    userID,
		UserType:  userType,
		IPAddress: ip,
		UserAgent: userAgent,
		Device:    "Unknown", // A proper user-agent parser can be added later
		LoginAt:   time.Now(),
	})
}

// Login handles user authentication and returns a JWT
func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	ip := c.IP()
	userAgent := string(c.Request().Header.UserAgent())

	// 1. BRUTE FORCE CHECK
	locked, lockedUntil := checkBruteForce(ip, input.Username)
	if locked {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"error": "Account temporarily locked due to too many failed attempts. Try again at " + lockedUntil.Format("15:04:05"),
		})
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
			recordFailedLogin(ip, input.Username)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
		}

		// Verify Password
		dbPassword := admin.Password
		if admin.PasswordHash != "" {
			dbPassword = admin.PasswordHash
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(input.Password)); err != nil {
			recordFailedLogin(ip, input.Username)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
		}

		// Success
		recordSuccessfulLogin(ip, input.Username, userAgent, "staff", admin.ID)

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
				"group":    "staff",
			},
		})
	}

	// 2. Student / Parent
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
		WHERE p.username = ? OR p.father_phone = ? OR s.student_id = ?
		LIMIT 1
	`

	if err := database.DB.Raw(query, input.Username, input.Username, input.Username).Scan(&result).Error; err != nil || result.ParentID == 0 {
		recordFailedLogin(ip, input.Username)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
	}

	// Verify Password
	if err := bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(input.Password)); err != nil {
		recordFailedLogin(ip, input.Username)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Incorrect username or password"})
	}

	// Update Login stats
	device := "Desktop"
	if len(userAgent) > 0 {
		device = "Unknown" // Can implement better detection if needed
	}

	database.DB.Exec("UPDATE parents SET login_count = login_count + 1, last_login = ?, last_device = ? WHERE id = ?", time.Now(), device, result.ParentID)

	// Success
	recordSuccessfulLogin(ip, input.Username, userAgent, "parent", result.ParentID)

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
			"group":    "student",
		},
	})
}
