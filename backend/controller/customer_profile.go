package controller

import (
	"net/http"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// GET /customer/profile
func GetCustomerProfile(c *gin.Context) {
	// สมมติว่า user id ถูกเก็บใน context ด้วย key "userID"
	userID, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var customer entity.Customer
	// preload Gender, User, Addresses
	if err := config.DB.Preload("Gender").Preload("User").Preload("Addresses").
		Where("user_id = ?", userID).First(&customer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, customer)
}
