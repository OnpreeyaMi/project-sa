package controller

import (
	"net/http"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
	"github.com/gin-gonic/gin"
)

func GetPromotionUsages(c *gin.Context) {
	var usages []entity.PromotionUsage
	if err := config.DB.Preload("Customer").Preload("Promotion").Preload("Order").Find(&usages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Map to response struct for frontend
	var resp []map[string]interface{}
	for _, u := range usages {
		resp = append(resp, map[string]interface{}{
			"ID": u.ID,
			"CustomerName": u.Customer.FirstName + " " + u.Customer.LastName,
			"PromotionCode": u.Promotion.PromotionName,
			"PromotionName": u.Promotion.Description,
			"OrderID": u.OrderID,
			"UsageDate": u.UsageDate.Format("2006-01-02"),
			"Status": u.Status,
		})
	}
	c.JSON(http.StatusOK, resp)
}
