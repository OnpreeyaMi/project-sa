package controller

import (
	"net/http"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your_secret_key")

// POST /login
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	if err := config.DB.
		Preload("Role").
		Preload("Customers.Addresses").
		Where("email = ?", input.Email).
		First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// ตรวจสอบ password
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil && user.Password != input.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role.Name,
		// เพิ่ม claims อื่นๆ ตามต้องการ
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role.Name,
		"token": tokenString,
		"customer": func() interface{} {
			if len(user.Customers) > 0 {
				var customer entity.Customer
				if err := config.DB.Preload("Addresses").Preload("Gender").First(&customer, user.Customers[0].ID).Error; err == nil {
					return customer
				}
				return user.Customers[0]
			}
			return nil
		}(),
	})
}