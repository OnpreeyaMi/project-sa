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
		ServiceTypeIDs []uint `json:"servicetype_ids"`
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

	// map servicetypes
	if len(req.ServiceTypeIDs) > 0 {
		var servicetypes []entity.ServiceType
		if err := config.DB.Find(&servicetypes, req.ServiceTypeIDs).Error; err == nil {
			config.DB.Model(&order).Association("ServiceTypes").Append(servicetypes)
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
		Status:  "รอดำเนินการ",
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
// ดึงออเดอร์ทั้งหมด
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
// ดึงออเดอร์ทั้งหมด
func GetOrders(c *gin.Context) {
	var orders []entity.Order
	if err := config.DB.Preload("Customer").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// ดึงที่อยู่ทั้งหมดของลูกค้าที่ใช้งาน
func GetAddresses(c *gin.Context) {
	customerID := c.Query("customer_id")
	var addresses []entity.Address
	if customerID != "" {
		if err := config.DB.Where("customer_id = ?", customerID).Preload("Customer").Find(&addresses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := config.DB.Preload("Customer").Find(&addresses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, addresses)
}

// ดึงชื่อ-นามสกุลลูกค้าจาก ID
func GetCustomerNameByID(c *gin.Context) {
	id := c.Param("id")
	var customer entity.Customer
	if err := config.DB.Preload("User").First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	firstName := customer.FirstName
	lastName := customer.LastName

	c.JSON(http.StatusOK, gin.H{
		"firstName": firstName,
		"lastName":  lastName,
	})
}

// เพิ่มฟังก์ชันสร้าง address ใหม่และเชื่อมกับลูกค้า
func CreateNewAddress(c *gin.Context) {
	var req struct {
		AddressDetails string  `json:"addressDetails"`
		Latitude       float64 `json:"latitude"`
		Longitude      float64 `json:"longitude"`
		CustomerID     uint    `json:"customerId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	address := entity.Address{
		AddressDetails: req.AddressDetails,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		CustomerID:     req.CustomerID,
	}
	if err := config.DB.Create(&address).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, address)
}

// อัพเดตที่อยู่หลักของลูกค้า
func UpdateMainAddress(c *gin.Context) {
	var req struct {
		CustomerID uint `json:"customer_id"`
		AddressID  uint `json:"address_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัพเดตที่อยู่ทั้งหมดของลูกค้าให้ไม่ใช่ที่อยู่หลัก
	if err := config.DB.Model(&entity.Address{}).
		Where("customer_id = ?", req.CustomerID).
		Update("is_default", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// อัพเดตที่อยู่ที่เลือกให้เป็นที่อยู่หลัก
	if err := config.DB.Model(&entity.Address{}).
		Where("id = ? AND customer_id = ?", req.AddressID, req.CustomerID).
		Update("is_default", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัพเดตที่อยู่หลักสำเร็จ"})
}

// ลดจำนวน InStock ของน้ำยาทางร้านเมื่อมีการสร้างออเดอร์
func DecreaseDetergentStock(detergentIDs []uint) error {
	for _, id := range detergentIDs {
		var detergent entity.Detergent
		if err := config.DB.First(&detergent, id).Error; err != nil {
			return err
		}
		if detergent.InStock > 0 {
			detergent.InStock -= 1
			if err := config.DB.Save(&detergent).Error; err != nil {
				return err
			}
		}
	}
	return nil
}

// GetDetergentsByType handles GET /detergents/type/:type for fetching detergents by type (e.g. Liquid, Softener)
func GetDetergentsByType(c *gin.Context) {
	detType := c.Param("type")
	var detergents []entity.Detergent
	if err := config.DB.Where("LOWER(type) = ?", detType).Find(&detergents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": detergents})
}