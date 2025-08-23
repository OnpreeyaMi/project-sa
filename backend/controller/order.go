package controller

import (
	"github.com/OnpreeyaMi/project-sa/entity" // ดูmodule at go.mod
	"github.com/gin-gonic/gin"
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"
)

// CreateOrder รับข้อมูลจาก frontend แล้วบันทึกลง DB
func CreateOrder(c *gin.Context) {
	var req struct {
		CustomerID   uint                 `json:"customer_id"`
		Servicetypes []entity.Servicetype `json:"servicetypes"`
		Detergents   []entity.Detergent   `json:"detergents"`
		OrderImage   string               `json:"order_image"`
		OrderNote    string               `json:"order_note"`
		AddressID    uint                 `json:"address_id"`
	}

	// Bind JSON จาก request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง order object
	order := entity.Order{
		CustomerID:   req.CustomerID,
		Servicetypes: req.Servicetypes,
		Detergents:   req.Detergents,
		OrderImage:   req.OrderImage,
		OrderNote:    req.OrderNote,
		AddressID:    req.AddressID,
	}

	// บันทึกลง DB
	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่ง response กลับ frontend
	c.JSON(http.StatusOK, order)
}
