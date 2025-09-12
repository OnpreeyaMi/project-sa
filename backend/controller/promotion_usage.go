package controller

import (
	"net/http"
	"time"

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
		CustomerName := "-"
		if u.Customer != nil {
			CustomerName = u.Customer.FirstName + " " + u.Customer.LastName
		}
		promotionCode := "-"
		promotionName := "-"
		if u.Promotion != nil {
			promotionCode = u.Promotion.PromotionName
			promotionName = u.Promotion.Description
		}
		orderID := u.OrderID
		usageDate := "-"
		if !u.UsageDate.IsZero() {
			usageDate = u.UsageDate.Format("2006-01-02")
		}
		status := u.Status
		resp = append(resp, map[string]interface{}{
			"ID":            u.ID,
			"CustomerName":  CustomerName,
			"PromotionCode": promotionCode,
			"PromotionName": promotionName,
			"OrderID":       orderID,
			"UsageDate":     usageDate,
			"Status":        status,
		})
	}
	c.JSON(http.StatusOK, resp)
}

func CreatePromotionUsage(c *gin.Context) {
	var input struct {
		UsageDate   string `json:"UsageDate"`
		Status      string `json:"Status"`
		PromotionID uint   `json:"PromotionID"`
		OrderID     uint   `json:"OrderID"`
		CustomerID  uint   `json:"CustomerID"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	usageDate, err := time.Parse("2006-01-02", input.UsageDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)"})
		return
	}

	usage := entity.PromotionUsage{
		UsageDate:   usageDate,
		Status:      input.Status,
		PromotionID: input.PromotionID,
		OrderID:     input.OrderID,
		CustomerID:  input.CustomerID,
	}

	if err := config.DB.Create(&usage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่สำเร็จ: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "บันทึกข้อมูลการใช้โปรโมชั่นสำเร็จ", "ID": usage.ID})
}
