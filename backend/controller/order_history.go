package controller

import (
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// ดึงประวัติการสั่งซื้อทั้งหมด
func GetOrderHistories(c *gin.Context) {
	var histories []entity.OrderHistory

	// preload Order ด้วย (เพื่อดึงข้อมูล Order มาใช้ได้เลย เช่น ราคา/รูป/โน้ต)
	if err := config.DB.Preload("Order").Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, histories)
}
