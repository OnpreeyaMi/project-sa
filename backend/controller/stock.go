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