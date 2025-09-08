package controller

import (
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"	
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)
func CreateDetergent(c *gin.Context) {
	var detergent entity.Detergent
	if err := c.ShouldBindJSON(&detergent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&detergent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": detergent})
}

// CreateDetergentWithPurchase handles POST /detergents/purchase for adding a new detergent and its purchase record
func CreateDetergentWithPurchase(c *gin.Context) {
	type DetergentPurchaseRequest struct {
		Detergent entity.Detergent           `json:"detergent"`
		Purchase  entity.PurchaseDetergent   `json:"purchase"`
	}

	var req DetergentPurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Create Detergent
	if err := config.DB.Create(&req.Detergent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 2. Create PurchaseDetergent (link to new Detergent)
	purchase := req.Purchase
	purchase.DetergentID = req.Detergent.ID
	if err := config.DB.Create(&purchase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"detergent": req.Detergent, "purchase": purchase})
}

// GetDetergents handles GET /detergents for fetching all detergents
func GetDetergents(c *gin.Context) {
	var detergents []entity.Detergent
	if err := config.DB.Find(&detergents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": detergents})
}

// Delete detergent by ID
func DeleteDetergent(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&entity.Detergent{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Detergent deleted successfully"})
}

// ดึงประวัติการสั่งซื้อน้ำยาทั้งหมด
func GetPurchaseDetergentHistory(c *gin.Context) {
	var purchases []entity.PurchaseDetergent
	if err := config.DB.Preload("Detergent").Preload("User").Find(&purchases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": purchases})
}
// ประวัติการใช้น้ำยา
// POST /detergents/use
func UseDetergent(c *gin.Context) {
	var req struct {
		UserID      uint   `json:"user_id"`
		DetergentID uint   `json:"detergent_id"`
		Quantity    int    `json:"quantity"`
		Reason      string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var detergent entity.Detergent
	if err := config.DB.First(&detergent, req.DetergentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสินค้า"})
		return
	}
	if req.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "จำนวนต้องมากกว่า 0"})
		return
	}
	if detergent.InStock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "สินค้าไม่เพียงพอ"})
		return
	}

	// ลด stock
	detergent.InStock -= req.Quantity
	if err := config.DB.Save(&detergent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ลด stock ไม่สำเร็จ"})
		return
	}

	// บันทึกลง DetergentUsageHistory
	history := entity.DetergentUsageHistory{
		UserID: req.UserID,
		DetergentID: req.DetergentID,
		QuantityUsed: req.Quantity,
		Reason: req.Reason,
	}
	if err := config.DB.Create(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกประวัติไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ใช้สินค้าและบันทึกประวัติเรียบร้อย", "history": history})
}
// GET /detergents/usage-history
func GetDetergentUsageHistory(c *gin.Context) {
	var histories []entity.DetergentUsageHistory
	if err := config.DB.Preload("User").Preload("Detergent").Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": histories})
}
