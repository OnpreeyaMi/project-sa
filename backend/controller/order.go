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
	if err := config.DB.Create(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// preload ก่อนส่งกลับ
	if err := config.DB.Preload("Customer").
		Preload("ServiceTypes").
		Preload("Detergents").
		Preload("Address").
		First(&order, order.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

// ดึงประวัติการสั่งซื้อทั้งหมด
func GetOrderHistories(c *gin.Context) {
	var histories []entity.OrderHistory
	if err := config.DB.Preload("Order").
		Preload("Order.Customer").
		Preload("Order.ServiceTypes").
		Preload("Order.Detergents").
		Preload("Order.Address").
		Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, histories)
}

func GetOrders(c *gin.Context) {
	var orders []entity.Order
	if err := config.DB.Preload("Customer").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// ดึงที่อยู่ทั้งหมด
func GetAddresses(c *gin.Context) {
	var addresses []entity.Address
	if err := config.DB.Preload("Customer").Find(&addresses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, addresses)
}
