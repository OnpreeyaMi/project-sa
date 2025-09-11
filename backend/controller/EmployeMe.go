package controller

import (
	"errors"
	"net/http"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /employee/me  (ต้องแนบ Bearer token)
// ใช้ user_id จาก JWT -> หา employee ที่ผูกกับ user_id นั้น
func GetEmployeeMe(c *gin.Context) {
	uidVal, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user in context"})
		return
	}
	userID := uidVal.(uint)

	var emp entity.Employee
	if err := config.DB.
		Preload("User").
		Preload("Position").
		Preload("EmployeeStatus").
		Where("user_id = ?", userID).
		First(&emp).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, emp)
}
