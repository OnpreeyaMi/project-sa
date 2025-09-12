// controller/orders_latest.go
package controller

import (
	"errors"
	"net/http"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/OnpreeyaMi/project-sa/config"
	"github.com/OnpreeyaMi/project-sa/entity"
)

type latestOrderResp struct {
	OrderID   uint      `json:"orderId"`
	Status    string    `json:"status,omitempty"`
	Amount    float64   `json:"amount,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}



func GetLatestOrderForCustomer(c *gin.Context) {
    customerIdStr := c.Param("customer_id")	
	customerID, err := strconv.ParseUint(customerIdStr,10,32)
	if err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error": "Invalid CustomerId"})
		return
	}
	// ดึงออเดอร์ล่าสุด
	var orders entity.Order
	if err := config.DB.Where("customer_id = ?", customerID).Order("created_at DESC").First(&orders).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "no_orders"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db_error"})
		return
	}
	

	resp := latestOrderResp{
		OrderID:   orders.ID,
		CreatedAt: orders.CreatedAt,
	}
	c.JSON(http.StatusOK, resp)
}
