package controller

import (
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity" // ดูmodule at go.mod
	"github.com/gin-gonic/gin"

)

// CreateOrder รับข้อมูลจาก frontend แล้วบันทึกลง DB
func CreateOrder(c *gin.Context) {
	var req struct {
		CustomerID     uint   `json:"customer_id"`
		ServicetypeIDs []uint `json:"servicetype_ids"`
		DetergentIDs   []uint `json:"detergent_ids"`
		OrderImage     string `json:"order_image"`
		OrderNote      string `json:"order_note"`
		AddressIDs     []uint `json:"address_ids"`
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
		//AddressID:    req.AddressID,
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

	// map addresses
	if len(req.AddressIDs) > 0 {
		var addresses []entity.Address
		if err := config.DB.Find(&addresses, req.AddressIDs).Error; err == nil {
			config.DB.Model(&order).Association("Address").Append(addresses)
		}
	}
	// ส่ง response กลับ frontend
	c.JSON(http.StatusOK, order)
}

func GetOrders(c *gin.Context) {
	var orders []entity.Order
	if err := config.DB.Preload("Customer").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// order = SELECT orders.* FROM orders LEFT JOIN customers ON orders.customer_id = customers.id

	c.JSON(http.StatusOK, orders)
}
