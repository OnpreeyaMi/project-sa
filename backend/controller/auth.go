package controller

import (
	"net/http"
	"fmt"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your_secret_key") // ให้ตรงกับ middlewares

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// POST /login
func Login(c *gin.Context) {
	var in LoginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	if err := config.DB.Preload("Role").Preload("Employee").
		Where("email = ?", in.Email).
		First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		fmt.Println("customer.Addresses:", user.Customers[0].Addresses)
		return
	}

	// compare hashed password
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(in.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}
	var employeeID uint
	if user.Employee != nil {
		employeeID = user.Employee.ID
	}

	claims := jwt.MapClaims{
		"user_id":     user.ID,
		"email":       user.Email,
		"role":        roleName,
		"employee_id": employeeID,
		"exp":         time.Now().Add(24 * time.Hour).Unix(),
		"iat":         time.Now().Unix(),
	}
	tk := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := tk.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// ส่งคีย์ตัวพิมพ์เล็กให้ฝั่ง Frontend ใช้ง่าย
	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"role":       roleName,
		"token":      tokenString,
		"employeeId": employeeID,
	})
}
