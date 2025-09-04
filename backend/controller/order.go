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
		ServiceTypeIDs []uint `json:"service_type_ids"`
		DetergentIDs   []uint `json:"detergent_ids"`
		OrderImage     string `json:"order_image"`
		OrderNote      string `json:"order_note"`
		AddressID      uint   `json:"address_id"`
	}

	// Bind JSON จาก request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง order object
	order := entity.Order{
		CustomerID: req.CustomerID,
		OrderImage: req.OrderImage,
		OrderNote:  req.OrderNote,
		AddressID:  req.AddressID,
	}

	// บันทึก order
	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ความสัมพันธ์ service types
	if len(req.ServiceTypeIDs) > 0 {
		var servicetypes []entity.ServiceType
		if err := config.DB.Find(&servicetypes, req.ServiceTypeIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		config.DB.Model(&order).Association("ServiceTypes").Append(servicetypes)
		// Append เข้า order -> GORM จะสร้าง record ใน OrderServiceType ให้เอง
		if err := config.DB.Model(&order).Association("ServiceTypes").Append(servicetypes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// ความสัมพันธ์ detergents
	if len(req.DetergentIDs) > 0 {
		var detergents []entity.Detergent
		if err := config.DB.Find(&detergents, req.DetergentIDs).Error; err == nil {
			config.DB.Model(&order).Association("Detergents").Append(detergents)
		}
	}

	// history เริ่มต้น
	history := entity.OrderHistory{
		OrderID: order.ID,
		Status:  "Pending",
	}
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

// GetAddresses handles GET /addresses for fetching all addresses
func GetAddresses(c *gin.Context) {
	var addresses []entity.Address
	if err := config.DB.Find(&addresses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": addresses})
}

func GetOrders(c *gin.Context) {
    customerId := c.Query("customerId")
    var orders []entity.Order
    db := config.DB.Preload("Address")
    if customerId != "" {
        db = db.Where("customer_id = ?", customerId)
    }
    if err := db.Find(&orders).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, orders)
}
