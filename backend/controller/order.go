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
		CustomerID   uint               `json:"customer_id"`
		ServicetypeIDs []uint 			`json:"servicetype_ids"`
		DetergentIDs   []uint			`json:"detergent_ids"`
		OrderImage   string             `json:"order_image"`
		OrderNote    string             `json:"order_note"`
		AddressID    uint               `json:"address_id"`
	}

	// Bind JSON จาก request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง order object
	order := entity.Order{
		CustomerID:   req.CustomerID,
		//Servicetype: req.ServicetypeID,
		//Detergent:   req.DetergentID,
		OrderImage:   req.OrderImage,
		OrderNote:    req.OrderNote,
		AddressID:    req.AddressID,
	}

	// บันทึกลง DB
	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// map servicetypes
	if len(req.ServicetypeIDs) > 0 {
		var servicetypes []entity.ServiceType
		if err := config.DB.Find(&servicetypes, req.ServicetypeIDs).Error; err == nil {
			config.DB.Model(&order).Association("Servicetypes").Append(servicetypes)
		}
	}

	// map detergents
	if len(req.DetergentIDs) > 0 {
		var detergents []entity.Detergent
		if err := config.DB.Find(&detergents, req.DetergentIDs).Error; err == nil {
			config.DB.Model(&order).Association("Detergents").Append(detergents)
		}
	}
	// ส่ง response กลับ frontend
	c.JSON(http.StatusOK, order)
}
