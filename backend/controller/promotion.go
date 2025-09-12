package controller

import (
	"net/http"
	"time"

	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

// -------------------- CREATE --------------------
type PromotionPayload struct {
	PromotionName  string                      `json:"promotionName"`
	Description    string                      `json:"description"`
	DiscountValue  uint                        `json:"discountValue"`
	StartDate      string                      `json:"startDate"`
	EndDate        string                      `json:"endDate"`
	Status         string                      `json:"status"`
	PromoImage     string                      `json:"promoImage"`
	DiscountTypeID uint                        `json:"discountTypeId"`
	Conditions     []PromotionConditionPayload `json:"conditions"`
}

type PromotionConditionPayload struct {
	ConditionType string `json:"conditionType"`
	Value         uint `json:"value"`
}

func CreatePromotion(c *gin.Context) {
	var payload PromotionPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, _ := time.Parse("2006-01-02", payload.StartDate)
	endDate, _ := time.Parse("2006-01-02", payload.EndDate)

	promotion := entity.Promotion{
		PromotionName:  payload.PromotionName,
		Description:    payload.Description,
		DiscountValue:  payload.DiscountValue,
		StartDate:      startDate,
		EndDate:        endDate,
		Status:         payload.Status,
		PromoImage:     payload.PromoImage,
		DiscountTypeID: payload.DiscountTypeID,
	}

	if err := config.DB.Create(&promotion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Add conditions
	for _, cond := range payload.Conditions {
		condition := entity.PromotionCondition{
			ConditionType: cond.ConditionType,
			Value:         cond.Value,
			PromotionID:   promotion.ID,
		}
		config.DB.Create(&condition)
	}

	c.JSON(http.StatusCreated, gin.H{"data": promotion})
}

// -------------------- READ --------------------
func GetPromotions(c *gin.Context) {
	var promotions []entity.Promotion
	if err := config.DB.Preload("DiscountType").Preload("PromotionCondition").Find(&promotions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, promotions)
}

func GetPromotionByID(c *gin.Context) {
	id := c.Param("id")
	var promotion entity.Promotion
	if err := config.DB.Preload("DiscountType").Preload("PromotionCondition").First(&promotion, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}
	c.JSON(http.StatusOK, promotion)
}

// -------------------- UPDATE --------------------
func UpdatePromotion(c *gin.Context) {
	id := c.Param("id")
	var payload PromotionPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var promotion entity.Promotion
	if err := config.DB.First(&promotion, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}

	startDate, _ := time.Parse("2006-01-02", payload.StartDate)
	endDate, _ := time.Parse("2006-01-02", payload.EndDate)

	promotion.PromotionName = payload.PromotionName
	promotion.Description = payload.Description
	promotion.DiscountValue = payload.DiscountValue
	promotion.StartDate = startDate
	promotion.EndDate = endDate
	promotion.Status = payload.Status
	promotion.PromoImage = payload.PromoImage
	promotion.DiscountTypeID = payload.DiscountTypeID

	if err := config.DB.Save(&promotion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ลบเงื่อนไขเดิมและเพิ่มใหม่
	config.DB.Where("promotion_id = ?", promotion.ID).Delete(&entity.PromotionCondition{})
	for _, cond := range payload.Conditions {
		condition := entity.PromotionCondition{
			ConditionType: cond.ConditionType,
			Value:         cond.Value,
			PromotionID:   promotion.ID,
		}
		config.DB.Create(&condition)
	}

	c.JSON(http.StatusOK, gin.H{"data": promotion})
}

// -------------------- DELETE --------------------
func DeletePromotion(c *gin.Context) {
	id := c.Param("id")
	var promotion entity.Promotion
	if err := config.DB.First(&promotion, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}
	config.DB.Where("promotion_id = ?", promotion.ID).Delete(&entity.PromotionCondition{})
	config.DB.Delete(&promotion)
	c.JSON(http.StatusOK, gin.H{"message": "Promotion deleted"})
}
